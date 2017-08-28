var mkEntry = function(id, number, text) {
  return {id: id, number: number, text: text};
}

var caringReason4DelayList = [];
caringReason4DelayList.push(mkEntry('1', '000001', 'Antragsteller im Krankenhaus/Reha-Einrichtung'));
caringReason4DelayList.push(mkEntry('2', '000002', 'wichtiger Behandlungstermin des Antragstellers'));
caringReason4DelayList.push(mkEntry('3', '000004', 'angek\u00fcndigter Termin von Antragsteller abgesagt (private Gr\u00fcnde)'));
caringReason4DelayList.push(mkEntry('4', '000008', 'beim angek\u00fcndigten Hausbesuch nicht angetroffen'));
caringReason4DelayList.push(mkEntry('5', '000016', 'Antragsteller umgezogen'));
caringReason4DelayList.push(mkEntry('6', '000032', 'angeforderte Unterlagen verz\u00f6gert eingetroffen'));
caringReason4DelayList.push(mkEntry('34', '000064', 'Verz\u00f6gerung durch den MDK'));