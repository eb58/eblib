var auListQuests = [
  {'question_id': 46, 'qnumber': '01', 'qtext': 'Dauer der AU / Besteht Arbeitsunfähigkeit? (Zweifel der Krankenkasse)'},
  {'question_id': 47, 'qnumber': '02', 'qtext': 'Sind Maßnahmen zur Sicherung des Behandlungserfolges erforderlich (z.B. ärztliche Behandlung, Rehabilitation)?'},
  {'question_id': 48, 'qnumber': '03', 'qtext': 'Liegen die medizinischen Voraussetzungen zur Anwendung des § 51 Abs. 1 SGB V vor?'},
  {'question_id': 49, 'qnumber': '04', 'qtext': 'Besteht ein Zusammenhang mit früheren AU-Zeiten? (Gilt nur bei Geschäftsvorfall Begutachtungsauftrag zur/zum Arbeitsunfähigkeit/ Krankengeld – Anfrage Zusammenhängigkeit AU)'},
  {'question_id': 50, 'qnumber': '05', 'qtext': 'Fragen zum Leistungsbild'},
  {'question_id': 51, 'qnumber': '06', 'qtext': 'Stufenweise Wiedereingliederung nach § 74 SGB V'},
  {'question_id': 52, 'qnumber': '07', 'qtext': 'Besteht Arbeitsunfähigkeit? (Zweifel des Arbeitgebers)'},
  {'question_id': 53, 'qnumber': '08', 'qtext': 'Besteht Arbeitsunfähigkeit? (Zweifel des Jobcenters)'},
  {'question_id': 54, 'qnumber': '93', 'qtext': 'Sonstige Fragestellung 93'},
  {'question_id': 55, 'qnumber': '94', 'qtext': 'Sonstige Fragestellung 94'},
  {'question_id': 56, 'qnumber': '95', 'qtext': 'Sonstige Fragestellung 95'},
  {'question_id': 57, 'qnumber': '96', 'qtext': 'Sonstige Fragestellung 96'},
  {'question_id': 58, 'qnumber': '97', 'qtext': 'Sonstige Fragestellung 97'},
  {'question_id': 59, 'qnumber': '98', 'qtext': 'Sonstige Fragestellung 98'},
  {'question_id': 60, 'qnumber': '99', 'qtext': 'Sonstige Fragestellung 99'}
];
var auListAnswers = [
  {"answer-id": null, "answer-number": '', "answer-text": 'keine Auswahl'},
  {"answer-id": 0, "answer-number": "1", "answer-text": "ja"},
  {"answer-id": 1, "answer-number": "2", "answer-text": "nein"},
  {"answer-id": 33, "answer-number": "3", "answer-text": "Andere Antwort"},
  {"answer-id": 3, "answer-number": "4", "answer-text": "Begutachtung empfohlen"}
];

var auListEffort = [
  {'au_effort_id': 13, 'au_effort_text': '0 bis unter 3 Stunden'},
  {'au_effort_id': 14, 'au_effort_text': '3 bis unter 6 Stunden'},
  {'au_effort_id': 15, 'au_effort_text': 'Ab 6 Stunden'},
  {'au_effort_id': 16, 'au_effort_text': 'unbekannt'}
];

var auListReduction = [
  {'au_reduction_id': 10, 'au_reduction_text': 'erhebliche Gefährdung der Erwerbsfähigkeit liegt vor'},
  {'au_reduction_id': 11, 'au_reduction_text': 'Minderung der Erwerbsfähigkeit liegt vor'},
  {'au_reduction_id': 12, 'au_reduction_text': 'liegt nicht vor'}
];

var auListStatement = [
  {'au_statement_id': 13, 'au_statement_text': 'der Versicherten / des Versicherten'},
  {'au_statement_id': 14, 'au_statement_text': 'des Arbeitgebers'},
  {'au_statement_id': 15, 'au_statement_text': 'der Krankenkasse'},
  {'au_statement_id': 16, 'au_statement_text': 'einer anderen Person'}
];

var auListSuggestion = [
  {'au_suggestion_id': 13, 'au_suggestion_text': 'stufenweise Wiedereingliederung'},
  {'au_suggestion_id': 14, 'au_suggestion_text': 'Leistungen zur medizinischen Rehabilitation'},
  {'au_suggestion_id': 15, 'au_suggestion_text': 'Leistungen zur Teilhabe am Arbeitsleben (LTA)'},
  {'au_suggestion_id': 16, 'au_suggestion_text': 'sonstige'}
];

var lists = {
  questionList: function questionList() {
    return auListQuests.map(function (o) {
      return {v: o['question-id'], txt: o['qtext']};
    });
  },
  answList: function answList() {
    return auListAnswers.map(function (o) {
      return {v: o['answer-id'], txt: o['answer-text']};
    });
  },
  statementList: function statementList() {
    return auListStatement.map(function (o) {
      return {v: o['au_statement_id'], txt: o['au_statement_text']};
    });
  },
  effortList: function effortList() {
    return auListEffort.map(function (o) {
      return {v: o['au_effort_id'], txt: o['au_effort_text']};
    });
  },
  resultList: function resultList() {
    return [
      {v: null, txt: 'keine Auswahl'},
      {v: 1, txt: 'Ja'},
      {v: 0, txt: 'Nein'},
      {v: 2, txt: 'Vielleicht'}
    ];
  }
};






