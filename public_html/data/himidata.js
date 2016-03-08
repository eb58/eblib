var quests = [
  [1, "01", "Ist das beantragte Hilfsmittel medizinisch notwendig?"],
  [2, "02", "Ist das beantragte Hilfsmittel notwendig um eine drohende Behinderung vorzubeugen bzw. eine bestehende Behinderung auszugleichen?"],
  [3, "03", "Wird durch das Hilfsmittel die Pflege erleichtert oder Beschwerden gelindert und / oder eine selbständige Lebensführung ermöglicht?"],
  [4, "04", "Ist die Versorgung wirtschaftlich?"],
  [5, "05", "Ist der therapeutische Nutzen des beantragten Hilfsmittels nachgewiesen?"],
  [6, "06", "Bestehen Alternativen zum beantragten Hilfsmittel (alternative Hilfsmittelversorgung/Therapieversorgung)?"],
  [7, "07", "Ist der Versicherte in der Lage das Hilfsmittel zu nutzen?"],
  [8, "08", "Kann sich die Erforderlichkeit der beantragten Hilfsmittelversorgung aufgrund der Prognose das Krankheitsverlaufs in absehbarer Zeit ändern?"],
  [9, "09", "Ist das vorhandene Hilfsmitel gebrauchsfähig (Evaluation gemäß § 275 Abs. 3 Sartz 3 SGB V)?"],
  [10, "80", "Sonstige Fragestellung 80?"],
  [11, "81", "Sonstige Fragestellung 81?"],
  [12, "82", "Sonstige Fragestellung 82?"],
  [13, "83", "Sonstige Fragestellung 83?"],
  [14, "84", "Sonstige Fragestellung 84?"],
  [15, "85", "Sonstige Fragestellung 85?"],
  [16, "86", "Sonstige Fragestellung 86?"],
  [17, "87", "Sonstige Fragestellung 87?"],
  [18, "88", "Sonstige Fragestellung 88?"],
  [19, "89", "Sonstige Fragestellung 89?"],
  [20, "90", "Sonstige Fragestellung 90?"],
  [21, "91", "Sonstige Fragestellung 91?"],
  [22, "92", "Sonstige Fragestellung 92?"],
  [23, "93", "Sonstige Fragestellung 93?"],
  [24, "94", "Sonstige Fragestellung 94?"],
  [25, "95", "Sonstige Fragestellung 95?"],
  [26, "96", "Sonstige Fragestellung 96?"],
  [27, "97", "Sonstige Fragestellung 97?"],
  [28, "98", "Sonstige Fragestellung 98?"],
  [29, "99", "Sonstige Fragestellung 99?"]
];
var answs = [
  [1, "1", "ja"],
  [2, "2", "nein"],
  [3, "3", "Andere Antwort"],
  [4, "4", "Begutachtung empfohlen"]
];

var jsonresult = {
  "himi": {
    "himis": [
      {
        "id": 0,
        "lfd-nr": 0,
        "number": 0,
        "text": 'Rollstuhl',
        "digital": false,
        "qas": [
          {"id": 1, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'},
          {"id": 2, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung wirtschaftlich?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'}
        ]
      },
      {
        "id": 1,
        "lfd-nr": 1,
        "number": 1,
        "text": 'Pflegebett',
        "digital": false,
        "qas": [
          {"id": 1, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'},
          {"id": 2, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung wirtschaftlich?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'}
        ]
      },
      {
        "id": 2,
        "lfd-nr": 2,
        "number": 2,
        "text": 'Krückstock',
        "digital": false,
        "qas": [
          {"id": 1, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'},
          {"id": 2, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung wirtschaftlich?", "answer-id": 1, "answer-number": '1', "answer-text": 'Ja', "motivation": 'bla bla bla'}
        ]
      }
    ],
    "global-answer-id": '1',
    "medical-base": 'Der Hauptwahlvorstand stellt fest, ob die nach Absatz 1 aus der Wählerliste eines Betriebs zu streichenden Arbeitnehmerinnen und Arbeitnehmer für die Wahl der Delegierten nach § 11 Abs. 3 und 4 des Gesetzes als Arbeitnehmerinnen und Arbeitnehmer des Betriebs der Hauptniederlassung des Unternehmens oder als Arbeitnehmerinnen und Arbeitnehmer des nach der Zahl der Wahlberechtigten größten Betriebs des Unternehmens gelten',
    "anamnesis": 'Für jeden Wahlvorschlag soll eine oder einer der Unterzeichnenden als Vorschlagsvertreter bezeichnet werden. Dieser ist berechtigt und verpflichtet, dem Betriebswahlvorstand die zur Beseitigung von Beanstandungen erforderlichen Erklärungen abzugeben sowie Erklärungen und Entscheidungen des Betriebswahlvorstands entgegenzunehmen.',
    "indication": 'Eine wunderbare Heiterkeit hat meine ganze Seele eingenommen, gleich den süßen Frühlingsmorgen, die ich mit ganzem Herzen genieße. Ich bin allein und freue mich meines Lebens in dieser Gegend, die für solche Seelen geschaffen ist wie die meine. Ich bin so glücklich, mein Bester, so ganz in dem Gefühle von ruhigem Dasein versunken,',
    "evaluation": 'Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind. Ich lese nicht sehr viele Zeitungen, aber ich habe gehört viele Situationen. Erstens: wir haben nicht offensiv gespielt. Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler. Zickler ist eine Spitzen mehr, Mehmet eh mehr Basler. Ist klar diese Wörter, ist möglich verstehen, was ich hab gesagt? Danke. Offensiv, offensiv ist wie machen wir in Platz. Zweitens: ich habe erklärt mit diese zwei Spieler: nach Dortmund brauchen vielleicht Halbzeit Pause. Ich habe auch andere Mannschaften gesehen in Europa nach diese Mittwoch. Ich habe gesehen auch zwei Tage die Training. Ein Trainer ist nicht ein Idiot! Ein Trainer sei sehen was passieren in Platz. In diese Spiel es waren zwei, drei diese Spieler waren schwach wie eine Flasche leer! Haben Sie gesehen Mittwoch, welche Mannschaft hat gespielt Mittwoch?',
    "suggestion": 'Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel? Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte seiner Arbeit zu erleichtern? Oder gehörten die Schritte hinter ihm zu einem der unzähligen Gesetzeshüter dieser Stadt, und die stählerne Acht um seine Handgelenke würde gleich zuschnappen? Er konnte die Aufforderung stehen zu bleiben schon hören. Gehetzt sah er sich um.'
  },
  "error": null,
  "errorCode": null
};

var himi = {
  himis: [
    ['Rollstuhl', 'id1', 'id1', [{quest: 1, answ: 2, reason: 'blabla'}, {quest: 2, answ: 2, reason: 'blabla blabla'}]],
    ['Pflegebett', 'id2', 'id2'],
    ['Krückstock', 'id3', 'id3']
  ],
  'auftrags-anwort': 'Antwort3',
  'medizinische-unterlagen': 'Der Hauptwahlvorstand stellt fest, ob die nach Absatz 1 aus der Wählerliste eines Betriebs zu streichenden Arbeitnehmerinnen und Arbeitnehmer für die Wahl der Delegierten nach § 11 Abs. 3 und 4 des Gesetzes als Arbeitnehmerinnen und Arbeitnehmer des Betriebs der Hauptniederlassung des Unternehmens oder als Arbeitnehmerinnen und Arbeitnehmer des nach der Zahl der Wahlberechtigten größten Betriebs des Unternehmens gelten',
  'anamnese': 'Für jeden Wahlvorschlag soll eine oder einer der Unterzeichnenden als Vorschlagsvertreter bezeichnet werden. Dieser ist berechtigt und verpflichtet, dem Betriebswahlvorstand die zur Beseitigung von Beanstandungen erforderlichen Erklärungen abzugeben sowie Erklärungen und Entscheidungen des Betriebswahlvorstands entgegenzunehmen.',
  'befund': 'Eine wunderbare Heiterkeit hat meine ganze Seele eingenommen, gleich den süßen Frühlingsmorgen, die ich mit ganzem Herzen genieße. Ich bin allein und freue mich meines Lebens in dieser Gegend, die für solche Seelen geschaffen ist wie die meine. Ich bin so glücklich, mein Bester, so ganz in dem Gefühle von ruhigem Dasein versunken,',
  'antwort-mit-begründung': 'Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind. Ich lese nicht sehr viele Zeitungen, aber ich habe gehört viele Situationen. Erstens: wir haben nicht offensiv gespielt. Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, Jancka und dann Zickler. Wir müssen nicht vergessen Zickler. Zickler ist eine Spitzen mehr, Mehmet eh mehr Basler. Ist klar diese Wörter, ist möglich verstehen, was ich hab gesagt? Danke. Offensiv, offensiv ist wie machen wir in Platz. Zweitens: ich habe erklärt mit diese zwei Spieler: nach Dortmund brauchen vielleicht Halbzeit Pause. Ich habe auch andere Mannschaften gesehen in Europa nach diese Mittwoch. Ich habe gesehen auch zwei Tage die Training. Ein Trainer ist nicht ein Idiot! Ein Trainer sei sehen was passieren in Platz. In diese Spiel es waren zwei, drei diese Spieler waren schwach wie eine Flasche leer! Haben Sie gesehen Mittwoch, welche Mannschaft hat gespielt Mittwoch?',
  'empfehlung': 'Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel? Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte seiner Arbeit zu erleichtern? Oder gehörten die Schritte hinter ihm zu einem der unzähligen Gesetzeshüter dieser Stadt, und die stählerne Acht um seine Handgelenke würde gleich zuschnappen? Er konnte die Aufforderung stehen zu bleiben schon hören. Gehetzt sah er sich um.'
};



