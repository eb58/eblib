const fags = [
  {value: null, code: '', text: ""},
  {value: 126, code: 210, text: "Notwendigkeit und Dauer der station\u00e4ren Krankenhausbehandlung (\u00A7112 Abs.2 Nr.2 SGB V)"},
  {value: 2, code: 230, text: "DRG ordnungsgem\u00e4\u00dfe Abrechnung"},
  {value: 3, code: 231, text: "DRG ordnungsgem\u00e4\u00dfe Abrechnung und Dauer und Notwendigkeit von Krankenhausbehandlung"},
  {value: 4, code: 240, text: "Krankenhausbehandlung mit Abrechnung nach Bundespflegesatzverordnung"},
  {value: 5, code: 250, text: "Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz"},
  {value: 6, code: 251, text: "Frage 251"},
  {value: 7, code: 270, text: "Krankenhausleistungen in psychiatrischen und psychosomatischen Einrichtungen mit Abrechnung nach tagesbezogenen Pauschalen"},
];

const fagsPrecision = [
  {value: null, code: "", text: ""},
  {value: 1, code: 13, text: "Dauer der AU"},
  {value: 2, code: 15, text: "Wiederholter Arztwechsel"},
  {value: 3, code: 17, text: "Sonstige Zweifel an der AU"}
];

const products = [
  {value: null, code: "", text: ""},
  {value: 38, code: 67, text: "Produkt 1"},
  {value: 3, code: 68, text: "Produkt 2"},
  {value: 4, code: 69, text: "Produkt 3"},
  {value: 5, code: 70, text: "Produkt 4"},
  {value: 6, code: 71, text: "Produkt 5"}
];

const gutachtenarten = [
  {value: null, code: "", text: ""},
  {value: 1, code: 66, text: "Gutachtenart 0"},
  {value: 16, code: 67, text: "Gutachtenart 1"},
  {value: 3, code: 68, text: "Gutachtenart 2"},
  {value: 4, code: 69, text: "Gutachtenart 3"},
];

const gutachtenartenPrecision = [
  {value: null, code: "", text: ""},
  {value: 1, code: 67, text: "Gutachtenartpr\u00e4zisierung 1"},
  {value: 2, code: 68, text: "Gutachtenartpr\u00e4zisierung 2"},
  {value: 3, code: 69, text: "Gutachtenartpr\u00e4zisierung 3"},
  {value: 4, code: 70, text: "Gutachtenartpr\u00e4zisierung 4"},
  {value: 5, code: 71, text: "Gutachtenartpr\u00e4zisierung 5"},
  {value: 11, code: 72, text: "Gutachtenartpr\u00e4zisierung 6"},
  {value: 12, code: 73, text: "Gutachtenartpr\u00e4zisierung 7"},
];

const beratungsstellen = [
  {value: null, code: "", text: ""},
  {value: 1, text: "AnzeigeNameBZ1"},
  {value: 2, text: "Beratungsstelle1"},
  {value: 3, text: "Beratungsstelle2"},
  {value: 4, text: "Beratungsstelle3"},
]

const ordercodes = [
  {value: null, code: "", text: ""},
  {value: 5, code: 'KON-GA', text: "KON-GA Konsiliargutachten"},
  {value: 2, code: 'KU-ORG', text: "KU-ORG K\u00f6rperliche Untersuchung organisieren"},
  {value: 2, code: 'UN-ANF', text: "UN-ANF Unterlagen anfordern 2"},
]

const erledigungsarten = [
  {value: null, code: "", text: ""},
  {value: 4, code: '10', text: "10 Aktenlage"},
  {value: 14, code: '11', text: "11 SFB m\u00fcndlich/schriftlich"},
  {value: 5, code: '20', text: "20 Sozialmedizinische Begutachtung mit k\u00f6rperlicher Untersuchung"},
  {value: 10, code: '21', text: "21 Begutachtung mit symptombezogener pers\u00f6nlicher Befunderhebung"},
]

const erledigungsorte = [
  {value: null, code: "", text: ""},
  {value: 11, code: '03', text: "03 im Krankenhaus oder anderer Einrichtung"},
  {value: 4, code: '10', text: "10 Beratungsstelle / BBZ"},
  {value: 5, code: '20', text: "20 An anderer Stelle"},
  {value: 6, code: '30', text: "30 in h\u00e4uslicher Umgebung"},
  {value: 10, code: '40', text: "40 Im h\u00e4uslichen Umfeld"},
  {value: 12, code: '62', text: "62 in vollstation\u00e4rer Pflegeeinrichtung"},
]

const results = [
  {value: null, code: "", text: ""},
  {value: 22, code: '50', text: "50 Medizinische Voraussetzungen f\u00fcr die Leistung erf\u00fcllt"},
  {value: 21, code: '60', text: "60 Medizinische Voraussetzungen f\u00fcr die Leistung nicht erf\u00fcllt"},
  {value: 16, code: '90', text: "90 Andere Antwort"},
]

const reasonsOfPrgDelay = [
  {value: null, code: "", text: ""},
  {value: 1, text: "Keine Verz\u00f6gerung"},
  {value: 2, text: "Der Versicherte steht f\u00fcr notwendige Befunderhebung / Hausbesuch nicht zur Verf\u00fcgung"},
  {value: 3, text: "Unverzichtbare angeforderte Ausk\u00fcnfte / Unterlagen gingen nicht fristgerecht ein"},
]

const servicerendererTypes = [
  {value:'Leistungserbringer', text: 'Leistungserbringer'},
  {value:'Krankenhaus',text: 'Krankenhaus'},
  {value:'Sanit\u00e4tshaus',text: 'Sanit\u00e4tshaus'},
  {value:'Pflegeeinrichtung',text: 'Pflegeeinrichtung'},
]


const valuelists = {
  fags: fags,
  fagsPrecision: fagsPrecision,
  products: products,
  gutachtenarten: gutachtenarten,
  gutachtenartenPrecision: gutachtenartenPrecision,
  beratungsstellen: beratungsstellen,
  ordercodes: ordercodes,
  erledigungsarten: erledigungsarten,
  erledigungsorte: erledigungsorte,
  results: results,
  reasonsOfPrgDelay: reasonsOfPrgDelay,
  servicerendererTypes:servicerendererTypes
};
