const fags = [
  {value: -1, code: '', text: ""},
  {value: 1, code: 210, text: "Notwendigkeit und Dauer der stationären Krankenhausbehandlung (§112 Abs.2 Nr.2 SGB V)"},
  {value: 2, code: 230, text: "DRG ordnungsgemäße Abrechnung"},
  {value: 3, code: 231, text: "DRG ordnungsgemäße Abrechnung und Dauer und Notwendigkeit von Krankenhausbehandlung"},
  {value: 4, code: 240, text: "Krankenhausbehandlung mit Abrechnung nach Bundespflegesatzverordnung"},
  {value: 5, code: 250, text: "Krankenhausbehandlung mit Abrechnung nach dem Krankenhausentgeltgesetz"},
  {value: 6, code: 251, text: "Frage 251"},
  {value: 7, code: 270, text: "Krankenhausleistungen in psychiatrischen und psychosomatischen Einrichtungen mit Abrechnung nach tagesbezogenen Pauschalen"},
];

const fagsPrecision = [
  {value: -1, code: "", text: ""},
  {value: 1, code: 13, text: "Dauer der AU"},
  {value: 2, code: 15, text: "Wiederholter Arztwechsel"},
  {value: 3, code: 17, text: "Sonstige Zweifel an der AU"}
];

const products = [
  {value: -1, code: "", text: ""},
  {value: 2, code: 67, text: "Produkt 1"},
  {value: 3, code: 68, text: "Produkt 2"},
  {value: 4, code: 69, text: "Produkt 3"},
  {value: 5, code: 70, text: "Produkt 4"},
  {value: 6, code: 71, text: "Produkt 5"}
];

const gutachtenarten = [
  {value: -1, code: "", text: ""},
  {value: 1, code: 66, text: "Gutachtenart 0"},
  {value: 2, code: 67, text: "Gutachtenart 1"},
  {value: 3, code: 68, text: "Gutachtenart 2"},
  {value: 4, code: 69, text: "Gutachtenart 3"},
];

const gutachtenartenPrecision = [
  {value: -1, code: "", text: ""},
  {value: 1, code: 67, text: "Gutachtenartpräzisierung 1"},
  {value: 2, code: 68, text: "Gutachtenartpräzisierung 2"},
  {value: 3, code: 69, text: "Gutachtenartpräzisierung 3"},
  {value: 4, code: 70, text: "Gutachtenartpräzisierung 4"},
  {value: 5, code: 71, text: "Gutachtenartpräzisierung 5"},
  {value: 6, code: 72, text: "Gutachtenartpräzisierung 6"},
  {value: 6, code: 73, text: "Gutachtenartpräzisierung 7"},
];

const beratungsstellen = [
  {value: 1, text: "AnzeigeNameBZ1"},
  {value: 2, text: "Beratungsstelle1"},
  {value: 3, text: "Beratungsstelle2"},
  {value: 4, text: "Beratungsstelle3"},
]

const ordercodes = [
  {value: -1, code: "", text: ""},
  {value: 5, code: 'KON-GA', text: "KON-GA Konsiliargutachten"},
  {value: 2, code: 'KU-ORG', text: "KU-ORG Körperliche Untersuchung organisieren"},
  {value: 2, code: 'UN-ANF', text: "UN-ANF Unterlagen anfordern 2"},
]

const erledigungsarten = [
  {value: -1, code: "", text: ""},
  {value: 4, code: '10', text: "10 Aktenlage"},
  {value: 14, code: '11', text: "11 SFB mündlich/schriftlich"},
  {value: 5, code: '20', text: "20 Sozialmedizinische Begutachtung mit körperlicher Untersuchung"},
  {value: 10, code: '21', text: "21 Begutachtung mit symptombezogener persönlicher Befunderhebung"},
]

const erledigungsorte = [
  {value: -1, code: "", text: ""},
  {value: 11, code: '03', text: "03 im Krankenhaus oder anderer Einrichtung"},
  {value: 4, code: '10', text: "10 Beratungsstelle / BBZ"},
  {value: 5, code: '20', text: "20 An anderer Stelle"},
  {value: 6, code: '30', text: "30 in häuslicher Umgebung"},
  {value: 10, code: '40', text: "40 Im häuslichen Umfeld"},
  {value: 12, code: '62', text: "62 in vollstationärer Pflegeeinrichtung"},
]

const results = [
  {value: -1, code: "", text: ""},
  {value: 22, code: '50', text: "50 Medizinische Voraussetzungen für die Leistung erfüllt"},
  {value: 21, code: '60', text: "60 Medizinische Voraussetzungen für die Leistung nicht erfüllt"},
  {value: 16, code: '90', text: "90 Andere Antwort"},
]

const reasonsOfPrgDelay = [
  {value: -1, code: "", text: ""},
  {value: 1, text: "Keine Verzögerung"},
  {value: 2, text: "Der Versicherte steht für notwendige Befunderhebung / Hausbesuch nicht zur Verfügung"},
  {value: 3, text: "Unverzichtbare angeforderte Auskünfte / Unterlagen gingen nicht fristgerecht ein"},
]

const servicerendererTypes = [
  {value:'Leistungserbringer', text: 'Leistungserbringer'},
  {value:'Krankenhaus',text: 'Krankenhaus'},
  {value:'Sanitätshaus',text: 'Sanitätshaus'},
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
}
