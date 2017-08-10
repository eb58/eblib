var result = {
  data: {
    'aus': [
      {'au_question_id': 52, 'qnumber': '07', 'qtext': 'Besteht Arbeitsunfähigkeit? (Zweifel des Arbeitgebers)', explanation: 'Der Arbeitgeber möchte das genauer wissen!!!', 'answer-id': 0},
      {'au_question_id': 53, 'qnumber': '08', 'qtext': 'Besteht Arbeitsunfähigkeit? (Zweifel des Jobcenters)', explanation: 'Das Jobcenter möchte das genauer wissen.', 'answer-id': 2}, 
    ],
    'au-since': '01.01.2017', // Arbeitsunfähig seit

    'medical-base': 'Medizinische Unterlagen', // Medizinische Unterlagen
    'anamnesis': 'Anamnese', //Anamnese
    'practice': 'Rehabilitations- und Rentenverfahren, GdB, GdS', //Rehabilitations- und Rentenverfahren, GdB, GdS
    'profile': 'Anforderungsprofil der Bezugstätigkeit', // Anforderungsprofil der Bezugstätigkeit

    'au-statement': null, //Angabenquelle
    'agency-start-date': null, //Bei der Arbeitsagentur in Vermittlung seit
    'au-effort-id': 10, //Zeitlicher Vermittlungsaufwand''
    'indication': 'Befund', // Befund

    'icds': [
      {
        'icd-code-id': 141968,
        'icd-code-number': 'A48.2',
        'text': 'Legionellose ohne Pneumonie [Pontiac-Fieber]',
        'digital': true
      },
    ],
    'summary': 'Zusammenfassung', //Zusammenfassung
    'rating': 'Sozialmedizinische Beurteilung der AU', // Sozialmedizinische Beurteilung der AU
    'accordance': 'Übereinstimmung von Leistungsvermögen mit Anforderungsprofil der zuletzt ausgeübten/maßgeblichen Tätigkeit',
    'result': null, //Ergebnis 0/1
    'duration': 10, // Erledigungszeit in Minuten
    'setup-time': 120, //Rüstzeit in Minuten
    'expertise-date': '01.01.2017', // Begutachtungsdatum
    'au-reduction': 10, //  Gefährdung/Minderung der Erwerbsfähigkeit
    'au-suggestion': 13, //Sozialmedizinische Empfehlung

    'suggestion-comment': 'Erläuterung Sozialmedizinische Empfehlung', // Erläuterung Sozialmedizinische Empfehlung
    'reminder-comment': 'weitere Angaben', // weitere Angaben, wenn Erneute Vorlage = 1 

    'notification': 0, // Das Begutachtungsergebnis wurde der/dem Versicherten mitgeteilt 0/1
    'reminder': 0, // Erneute Vorlage 0/1
    'DELIVERY_CONFIG_ID_AG': null, // Versandeinstellung Auftraggeber
    'DELIVERY_CONFIG_ID_LE': null, // Versandeinstellung Leistungserbringer
  },
  error: null,
  errorCode: null
};

