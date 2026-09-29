// Dossiês com local público e não sensível: o site os trata como local exato mesmo que o painel não os tenha
// marcado (GUIA-EDITORIAL.md). mapQuery é o nome/endereço aberto no Google Maps; sem ele, valem as coordenadas.
// Crimes, residências, locais ligados a vítimas e pontos indefinidos não entram nesta lista.
// build_pages.py lê este arquivo como JSON (o objeto entre as chaves).
export default {
  "edificio-martinelli-sao-paulo": {"mapQuery": "Edifício Martinelli, São Paulo", "reason": "Edifício histórico aberto ao público"},
  "revisao-incendio-edificio-joelma-1974": {"mapQuery": "Edifício Joelma, Avenida Nove de Julho, São Paulo", "reason": "Edifício comercial conhecido, hoje Edifício Praça da Bandeira"},
  "castelinho-rua-apa-1937": {"mapQuery": "Castelinho da Rua Apa, São Paulo", "reason": "Imóvel tombado, hoje sede de projeto social"},
  "catacumbas-de-paris-ossuario-cidade-subterranea": {"mapQuery": "Catacombes de Paris", "reason": "Museu público"},
  "cecil-hotel-historia-los-angeles": {"mapQuery": "Hotel Cecil, 640 S Main St, Los Angeles", "reason": "Edifício histórico conhecido"},
  "castelo-cachtice-condessa-erzsebet-bathory": {"mapQuery": "Čachtický hrad, Čachtice", "reason": "Ruínas de castelo abertas à visitação"},
  "cratera-darvaza-porta-do-inferno": {"mapQuery": "Darvaza gas crater", "reason": "Ponto turístico"},
  "chernobyl-desastre-nuclear-1986": {"mapQuery": "Chernobyl Nuclear Power Plant", "reason": "Instalação conhecida mundialmente"},
  "manuscrito-voynich-ms-408": {"mapQuery": "Beinecke Rare Book & Manuscript Library, New Haven", "reason": "Biblioteca que guarda o manuscrito"},
  "ponte-overtoun-caes-entre-fatos-e-lenda": {"mapQuery": "Overtoun Bridge, Dumbarton", "reason": "Ponte pública"},
  "ilha-das-bonecas-xochimilco": {"mapQuery": "Isla de las Muñecas, Xochimilco", "reason": "Ponto turístico"},
  "farol-ilhas-flannan-tres-faroleiros-1900": {"mapQuery": "Flannan Isles Lighthouse", "reason": "Farol histórico"},
  "ilha-de-poveglia-veneza": {"mapQuery": "Poveglia, Venezia", "reason": "Ilha da laguna de Veneza"},
  "centralia-incendio-subterraneo-pensilvania": {"mapQuery": "Centralia, Pennsylvania", "reason": "Localidade pública"},
  "mascaras-de-chumbo-morro-do-vintem-1966": {"mapQuery": "Morro do Vintém, Niterói", "reason": "Morro público citado nos documentos"},
  "julgamentos-bruxas-de-salem-1692": {"mapQuery": "Salem Witch Trials Memorial, Salem", "reason": "Memorial público"},
  "costa-dos-esqueletos-namibia-mar-deserto-naufragios": {"mapQuery": "Skeleton Coast National Park, Namibia", "reason": "Parque nacional"},
  "death-avenue-nova-york-trens-cowboys": {"mapQuery": "High Line, New York", "reason": "Via elevada pública que substituiu a ferrovia de rua"},
  "danca-de-1518-estrasburgo": {"mapQuery": "Strasbourg, France", "reason": "Cidade (o episódio não tem endereço preciso)"},
  "desaparecimentos-vale-da-morte-1996-2022": {"mapQuery": "Death Valley National Park", "reason": "Parque nacional"},
  "evento-tunguska-explosao-siberia-1908": {"reason": "Área remota do epicentro, pelas coordenadas cadastradas"},
  "luzes-de-hessdalen-noruega": {"mapQuery": "Hessdalen, Norway", "reason": "Vale público onde ficam as estações de observação"},
  "mothman-point-pleasant-silver-bridge-1966-1967": {"mapQuery": "McClintic Wildlife Management Area, Point Pleasant, West Virginia", "reason": "Área pública conhecida como TNT Area"},
  "passo-dyatlov-ural-1959": {"mapQuery": "Dyatlov Pass", "reason": "Passo de montanha conhecido"},
  "revisao-caso-et-de-varginha-1996": {"mapQuery": "Varginha, Minas Gerais", "reason": "Cidade (sem apontar residências de testemunhas)"},
  "revisao-noite-oficial-dos-ovnis-1986": {"mapQuery": "São José dos Campos, São Paulo", "reason": "Cidade de referência do episódio"},
  "revisao-operacao-prato-colares-1977": {"mapQuery": "Colares, Pará", "reason": "Cidade (sem apontar residências de testemunhas)"}
};
