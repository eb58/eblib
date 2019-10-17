const fags = [
  {v: null, code: '', txt: ""},
  {v: 126, code: 210, txt: "Notwendigkeit und Dauer der station\u00e4ren Krankenhausbehandlung (\u00A7112 Abs.2 Nr.2 SGB V)"},
  {v: 2, code: 230, txt: "DRG ordnungsgem\u00e4\u00dfe Abrechnung"},
  {v: 3, code: 231, txt: "DRG ordnungsgem\u00e4\u00dfe Abrechnung und Dauer und Notwendigkeit von Krankenhausbehandlung"},
  {v: 4, code: 240, txt: "Krankenhausbehandlung mit Abrechnung nach Bundespflegesatzverordnung"},
  {v: 5, code: 250, txt: "Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz"},
  {v: 6, code: 251, txt: "Frage 251"},
  {v: 7, code: 270, txt: "Krankenhausleistungen in psychiatrischen und psychosomatischen Einrichtungen mit Abrechnung nach tagesbezogenen Pauschalen"},
];

const fagsPrecision = [
  {v: null, code: "", txt: ""},
  {v: 1, code: 13, txt: "Dauer der AU"},
  {v: 2, code: 15, txt: "Wiederholter Arztwechsel"},
  {v: 3, code: 17, txt: "Sonstige Zweifel an der AU"}
];

const products = [
  {v: null, code: "", txt: ""},
  {v: 38, code: 67, txt: "Produkt 1"},
  {v: 3, code: 68, txt: "Produkt 2"},
  {v: 4, code: 69, txt: "Produkt 3"},
  {v: 5, code: 70, txt: "Produkt 4"},
  {v: 6, code: 71, txt: "Produkt 5"}
];

const gutachtenarten = [
  {v: null, code: "", txt: ""},
  {v: 1, code: 66, txt: "Gutachtenart 0"},
  {v: 16, code: 67, txt: "Gutachtenart 1"},
  {v: 3, code: 68, txt: "Gutachtenart 2"},
  {v: 4, code: 69, txt: "Gutachtenart 3"},
];

const gutachtenartenPrecision = [
  {v: null, code: "", txt: ""},
  {v: 1, code: 67, txt: "Gutachtenartpr\u00e4zisierung 1"},
  {v: 2, code: 68, txt: "Gutachtenartpr\u00e4zisierung 2"},
  {v: 3, code: 69, txt: "Gutachtenartpr\u00e4zisierung 3"},
  {v: 4, code: 70, txt: "Gutachtenartpr\u00e4zisierung 4"},
  {v: 5, code: 71, txt: "Gutachtenartpr\u00e4zisierung 5"},
  {v: 11, code: 72, txt: "Gutachtenartpr\u00e4zisierung 6"},
  {v: 12, code: 73, txt: "Gutachtenartpr\u00e4zisierung 7"},
];

const beratungsstellen = [
  {v: null, code: "", txt: ""},
  {v: 1, txt: "AnzeigeNameBZ1"},
  {v: 2, txt: "Beratungsstelle1"},
  {v: 3, txt: "Beratungsstelle2"},
  {v: 4, txt: "Beratungsstelle3"},
]

const ordercodes = [
  {v: null, code: "", txt: ""},
  {v: 5, code: 'KON-GA', txt: "KON-GA Konsiliargutachten"},
  {v: 2, code: 'KU-ORG', txt: "KU-ORG K\u00f6rperliche Untersuchung organisieren"},
  {v: 1, code: 'UN-ANF', txt: "UN-ANF Unterlagen anfordern 2"},
]

const erledigungsarten = [
  {v: null, code: "", txt: ""},
  {v: 4, code: '10', txt: "10 Aktenlage"},
  {v: 14, code: '11', txt: "11 SFB m\u00fcndlich/schriftlich"},
  {v: 5, code: '20', txt: "20 Sozialmedizinische Begutachtung mit k\u00f6rperlicher Untersuchung"},
  {v: 10, code: '21', txt: "21 Begutachtung mit symptombezogener pers\u00f6nlicher Befunderhebung"},
]

const erledigungsorte = [
  {v: null, code: "", txt: ""},
  {v: 11, code: '03', txt: "03 im Krankenhaus oder anderer Einrichtung"},
  {v: 4, code: '10', txt: "10 Beratungsstelle / BBZ"},
  {v: 5, code: '20', txt: "20 An anderer Stelle"},
  {v: 6, code: '30', txt: "30 in h\u00e4uslicher Umgebung"},
  {v: 10, code: '40', txt: "40 Im h\u00e4uslichen Umfeld"},
  {v: 12, code: '62', txt: "62 in vollstation\u00e4rer Pflegeeinrichtung"},
]

const results = [
  {v: null, code: "", txt: ""},
  {v: 22, code: '50', txt: "50 Medizinische Voraussetzungen f\u00fcr die Leistung erf\u00fcllt"},
  {v: 21, code: '60', txt: "60 Medizinische Voraussetzungen f\u00fcr die Leistung nicht erf\u00fcllt"},
  {v: 16, code: '90', txt: "90 Andere Antwort"},
]

const reasonsOfPrgDelay = [
  {v: null, code: "", txt: ""},
  {v: 1, txt: "Keine Verz\u00f6gerung"},
  {v: 2, txt: "Der Versicherte steht f\u00fcr notwendige Befunderhebung / Hausbesuch nicht zur Verf\u00fcgung"},
  {v: 3, txt: "Unverzichtbare angeforderte Ausk\u00fcnfte / Unterlagen gingen nicht fristgerecht ein"},
]

const servicerendererTypes = [
  {v:'Leistungserbringer', txt: 'Leistungserbringer'},
  {v:'Krankenhaus',txt: 'Krankenhaus'},
  {v:'Sanit\u00e4tshaus',txt: 'Sanit\u00e4tshaus'},
  {v:'Pflegeeinrichtung',txt: 'Pflegeeinrichtung'},
]


const valuelists = {
//  fags: fags,
//  fagsPrecision: fagsPrecision,
//  products: products,
//  gutachtenarten: gutachtenarten,
//  gutachtenartenPrecision: gutachtenartenPrecision,
  beratungsstellen: beratungsstellen,
//  ordercodes: ordercodes,
  erledigungsarten: erledigungsarten,
  erledigungsorte: erledigungsorte,
  results: results,
  reasonsOfPrgDelay: reasonsOfPrgDelay,
  servicerendererTypes:servicerendererTypes
};
