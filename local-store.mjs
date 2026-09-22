import { existsSync, readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

// Single-process local storage. Keep this file outside dist/ and back it up with data/.
export class LocalStore {
  constructor(file) {
    this.file = file;
    this.data = existsSync(file)
      ? JSON.parse(readFileSync(file, 'utf8'))
      : { sessions: {}, comments: [], nextCommentId: 1 };
    if (!this.data.sessions || !Array.isArray(this.data.comments) || !Number.isSafeInteger(this.data.nextCommentId)) {
      throw new Error('Arquivo de dados locais inválido. Restaure a cópia de segurança.');
    }
  }

  save() {
    const temp = `${this.file}.${randomBytes(6).toString('hex')}.tmp`;
    try {
      writeFileSync(temp, JSON.stringify(this.data), { mode: 0o600 });
      renameSync(temp, this.file);
    } catch (error) {
      try { unlinkSync(temp); } catch {}
      throw error;
    }
  }

  session(key) { return this.data.sessions[key] || null; }
  addSession(key, csrf, expires) {
    for (const [old, session] of Object.entries(this.data.sessions)) {
      if (session.expires <= Date.now()) delete this.data.sessions[old];
    }
    this.data.sessions[key] = { csrf, expires };
    this.save();
  }
  removeSession(key) { delete this.data.sessions[key]; this.save(); }

  addComment(comment) {
    this.data.comments.push({ id: this.data.nextCommentId++, ...comment });
    this.save();
  }
  approvedForStory(slug) {
    return this.data.comments.filter(c => c.slug === slug && c.status === 'approved').slice(-100).reverse()
      .map(({ id, author, body, lang, created_at }) => ({ id, author, body, lang, created_at }));
  }
  approvedRecent() {
    return this.data.comments.filter(c => c.status === 'approved').slice(-300).reverse()
      .map(({ id, slug, author, body, lang, created_at }) => ({ id, slug, author, body, lang, created_at }));
  }
  allComments() { return this.data.comments.slice(-250).reverse().map(c => ({ ...c })); }
  updateComment(id, status) {
    const comment = this.data.comments.find(c => c.id === id);
    if (!comment) return false;
    comment.status = status;
    this.save();
    return true;
  }
  deleteComment(id) {
    const index = this.data.comments.findIndex(c => c.id === id);
    if (index < 0) return false;
    this.data.comments.splice(index, 1);
    this.save();
    return true;
  }
}
