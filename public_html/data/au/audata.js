var result = {
  data: {
    'medical-base': 'Medizinische Unterlagen',
    'anamnesis': 'Patient meint er sei krank',
    'indication': 'Der Patient ist tatsächlich krank',
    'delivery-config-ag': null,
    'delivery-config-le': null,
    'start-date': '03.07.2017',
    'practice': 'GdB',
    'profile': 'Anforderungsprofil',
    'statement-id': 15,
    
    'agency-start-date': '09.05.2017',
    'effort-id': 13,

    'summary': 'Zusammenfassung',
    'rating': 'Sozialmedizinische Beurteilung der AU',
    'accordance': 'Übereinstimmung von Leistungsvermögen mit Anforderungsprofil der zuletzt ausgeübten/maßgeblichen Tätigkeit',
    'duration': 10, // Erledigungszeit in Minuten
    'setup-time': 120, //Rüstzeit in Minuten
    'expertise-date': '01.01.2017', // Begutachtungsdatum
    'reduction-id': 10, //  Gefährdung/Minderung der Erwerbsfähigkeit
    'suggestion-id': 13, //Sozialmedizinische Empfehlung
    'suggestion-comment': 'Erläterung Sozialmedizinische Empfehlung', // Erläuterung Sozialmedizinische Empfehlung
    'hints': 'Hinweise auf besondere Ursachen', // Hinweise auf besondere Ursachen
    'notification': 0, // Das Begutachtungsergebnis wurde der/dem Versicherten mitgeteilt 0/1
    'reminder': 0, // Erneute Vorlage 0/1
    'reminder-comment': 'Erläuterung, wenn Erneute Vorlage', // Erläuterung, wenn Erneute Vorlage = 1
    'preventSrInformation': true,
    'associated': false,
    'qas': [{
        'question-id': 52, 
        'question-number': '07', 
        'qtext': 'Besteht Arbeitsunfähigkeit? (Zweifel des Arbeitgebers)', 
        'question-comment': 'Der Arbeitgeber möchte das genauer wissen!!!', 
        'answer-id': 0
      },
      {
        'question-id': 53, 
        'question-number': '08', 
        'question-text': 'Besteht Arbeitsunfähigkeit? (Zweifel des Jobcenters)', 
        'question-comment': 'Das Jobcenter möchte das genauer wissen.', 
        'answer-id': 2},
    ],
    'icds': [
      {
        'icd-code-id': 141968,
        'icd-code-number': 'A48.2',
        'text': 'Legionellose ohne Pneumonie [Pontiac-Fieber]',
        'digital': true
      },
    ],
    'result': null, //Ergebnis 0/1
  },
  error: null,
  errorCode: null
};

