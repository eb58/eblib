/* global _ */

var quests = [
    {"question-id": 1, "question-number": "01", "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?"},
    {"question-id": 2, "question-number": "02", "question-text": "Ist das beantragte Hilfsmittel notwendig um eine drohende Behinderung vorzubeugen bzw. eine bestehende Behinderung auszugleichen?"},
    {"question-id": 3, "question-number": "03", "question-text": "Wird durch das Hilfsmittel die Pflege erleichtert oder Beschwerden gelindert und / oder eine selbständige Lebensführung ermöglicht?"},
    {"question-id": 4, "question-number": "04", "question-text": "Ist die Versorgung wirtschaftlich?"},
    {"question-id": 5, "question-number": "05", "question-text": "Ist der therapeutische Nutzen des beantragten Hilfsmittels nachgewiesen?"},
    {"question-id": 6, "question-number": "06", "question-text": "Bestehen Alternativen zum beantragten Hilfsmittel (alternative Hilfsmittelversorgung/Therapieversorgung)?"},
    {"question-id": 7, "question-number": "07", "question-text": "Ist der Versicherte in der Lage das Hilfsmittel zu nutzen?"},
    {"question-id": 8, "question-number": "08", "question-text": "Kann sich die Erforderlichkeit der beantragten Hilfsmittelversorgung aufgrund der Prognose das Krankheitsverlaufs in absehbarer Zeit ändern?"},
    {"question-id": 9, "question-number": "09", "question-text": "Ist das vorhandene Hilfsmitel gebrauchsfähig (Evaluation gemäß § 275 Abs. 3 Sartz 3 SGB V)?"},
    {"question-id": 10, "question-number": "80", "question-text": "Sonstige Fragestellung 80?"},
    {"question-id": 11, "question-number": "81", "question-text": "Sonstige Fragestellung 81?"},
    {"question-id": 12, "question-number": "82", "question-text": "Sonstige Fragestellung 82?"},
    {"question-id": 13, "question-number": "83", "question-text": "Sonstige Fragestellung 83?"},
    {"question-id": 14, "question-number": "84", "question-text": "Sonstige Fragestellung 84?"},
    {"question-id": 15, "question-number": "85", "question-text": "Sonstige Fragestellung 85?"},
    {"question-id": 16, "question-number": "86", "question-text": "Sonstige Fragestellung 86?"},
    {"question-id": 17, "question-number": "87", "question-text": "Sonstige Fragestellung 87?"},
    {"question-id": 18, "question-number": "88", "question-text": "Sonstige Fragestellung 88?"},
    {"question-id": 19, "question-number": "89", "question-text": "Sonstige Fragestellung 89?"},
    {"question-id": 20, "question-number": "90", "question-text": "Sonstige Fragestellung 90?"},
    {"question-id": 21, "question-number": "91", "question-text": "Sonstige Fragestellung 91?"},
    {"question-id": 22, "question-number": "92", "question-text": "Sonstige Fragestellung 92?"},
    {"question-id": 23, "question-number": "93", "question-text": "Sonstige Fragestellung 93?"},
    {"question-id": 24, "question-number": "94", "question-text": "Sonstige Fragestellung 94?"},
    {"question-id": 25, "question-number": "95", "question-text": "Sonstige Fragestellung 95?"},
    {"question-id": 26, "question-number": "96", "question-text": "Sonstige Fragestellung 96?"},
    {"question-id": 27, "question-number": "97", "question-text": "Sonstige Fragestellung 97?"},
    {"question-id": 28, "question-number": "98", "question-text": "Sonstige Fragestellung 98?"},
    {"question-id": 29, "question-number": "99", "question-text": "Sonstige Fragestellung 99?"}
];
var answs = [
    {"answer-id": null, "answer-number": '', "answer-text": 'keine Auswahl'},
    {"answer-id": 0,    "answer-number": "1", "answer-text": "ja"},
    {"answer-id": 1,    "answer-number": "2", "answer-text": "nein"},
    {"answer-id": 33,   "answer-number": "3", "answer-text": "Andere Antwort"},
    {"answer-id": 3,    "answer-number": "4", "answer-text": "Begutachtung empfohlen"}
];
var sugg = [
    {'himi_suggestion_id': null, 'himi_suggestion_number': '', 'himi_suggestion_text': 'keine Auswahl'},
    {'himi_suggestion_id': 2, 'himi_suggestion_number': '1', 'himi_suggestion_text': 'Empfehlung_1'},
    {'himi_suggestion_id': 3, 'himi_suggestion_number': '2', 'himi_suggestion_text': 'Empfehlung_2'}
];

var delivery = [
    {'himi_delivery_config_id': 1, 'himi_delivery_config_number': '', 'himi_delivery_config_text': 'Eingeschränkt', 'flags': 5},
    {'himi_delivery_config_id': 2, 'himi_delivery_config_number': '', 'himi_delivery_config_text': 'Ergebnis', 'flags': 7},
    {'himi_delivery_config_id': 3, 'himi_delivery_config_number': '', 'himi_delivery_config_text': 'Nichts', 'flags': 3},
    {'himi_delivery_config_id': 4, 'himi_delivery_config_number': '', 'himi_delivery_config_text': 'Alles', 'flags': 7}
];
var deliveryLeistungserbringer = _.filter(delivery, function (o) {
    return o.flags & 1;
});
var deliverySanitaetshaus = _.filter(delivery, function (o) {
    return o.flags & 2;
});
var deliveryAuftraggeber = _.filter(delivery, function (o) {
    return o.flags & 4;
});

