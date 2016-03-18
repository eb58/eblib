/* global _ */

var quests = [
  //{"question-id": 1, "question-number": "01", "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?"},
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
  {"answer-id": 1, "answer-number": "1", "answer-text": "ja"},
  {"answer-id": 2, "answer-number": "2", "answer-text": "nein"},
  {"answer-id": 3, "answer-number": "3", "answer-text": "Andere Antwort"},
  {"answer-id": 4, "answer-number": "4", "answer-text": "Begutachtung empfohlen"}
];

var result = {
  "data": {
    "himis": [{
        "id": 0,
        "lfd-nr": 1,
        "number": '71',
        "text": 'Rollstuhl',
        "digital": true,
        "qas": [
          {"id": 1, digital: true, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 1, "answer-number": '1', "answer-text": 'ja', "motivation": 'Der Hauptwahlvorstand stellt fest, ob die nach Absatz 1 aus der Wählerliste eines Betriebs zu streichenden Arbeitnehmerinnen und Arbeitnehmer für die Wahl der Delegierten nach § 11 Abs. 3 und 4 des Gesetzes als Arbeitnehmerinnen und Arbeitnehmer des Bet'},
          {"id": 2, digital: true, "question-id": 4, "question-number": '04', "question-text": "Ist die Versorgung wirtschaftlich?", "answer-id": 1, "answer-number": '1', "answer-text": 'ja', "motivation": 'bla bla bla'}
        ]
      },
      {
        "id": 1,
        "lfd-nr": 2,
        "number": '12',
        "text": 'Pflegebett',
        "digital": true,
        "qas": [
          {"id": 1, digital: true, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 2, "answer-number": '2', "answer-text": 'nein', "motivation": 'Pflege  bla bla bla'},
          {"id": 2, digital: true, "question-id": 5, "question-number": '05', "question-text": "Ist der therapeutische Nutzen des beantragten Hilfsmittels nachgewiesen?", "answer-id": 1, "answer-number": '1', "answer-text": 'ja', "motivation": 'Pflege bla bla bla'}
        ]
      },
      {
        "id": -1,
        "number": '05',
        "text": 'Krückstock',
        "digital": false,
        "qas": [
          {"id": 1, digital: true, "question-id": 1, "question-number": '01', "question-text": "Ist das beantragte Hilfsmittel medizinisch notwendig?", "answer-id": 3, "answer-number": '3', "answer-text": 'Andere Antwort', "motivation": 'Krückstock bla bla bla'},
          {"id": 2, digital: true, "question-id": 4, "question-number": '09', "question-text": "Ist das vorhandene Hilfsmitel gebrauchsfähig (Evaluation gemäß § 275 Abs. 3 Sartz 3 SGB V)?", "answer-id": 1, "answer-number": '1', "answer-text": 'ja', "motivation": 'Krückstock bla bla bla'},
          {"id": -1, digital: false, "question-id": 7, "question-number": '07', "question-text": "Ist der Versicherte in der Lage das Hilfsmittel zu nutzen?", "answer-id": 1, "answer-number": '1', "answer-text": 'ja', "motivation": 'Krückstock bla bla bla'},
          {"id": -1, digital: false, "question-id": 10, "question-number": '80', "question-text": "Sonstige Fragestellung 80", "answer-id": 1, "answer-number": '1', "answer-text": 'ja', "motivation": 'Krückstock bla bla bla'}
        ]
      }
    ],
    "global-answer-id": '1',
    "medical-base": 'Der Hauptwahlvorstand stellt fest, ob die nach Absatz 1 aus der Wählerliste eines Betriebs zu streichenden Arbeitnehmerinnen und Arbeitnehmer für die Wahl der Delegierten nach § 11 Abs. 3 und 4 des Gesetzes als Arbeitnehmerinnen und Arbeitnehmer des Betriebs der Hauptniederlassung des Unternehmens oder als Arbeitnehmerinnen und Arbeitnehmer des nach der Zahl der Wahlberechtigten größten Betriebs des Unternehmens gelten',
    "anamnesis": 'Für jeden Wahlvorschlag soll eine oder einer der Unterzeichnenden als Vorschlagsvertreter bezeichnet werden. Dieser ist berechtigt und verpflichtet, dem Betriebswahlvorstand die zur Beseitigung von Beanstandungen erforderlichen Erklärungen abzugeben sowie Erklärungen und Entscheidungen des Betriebswahlvorstands entgegenzunehmen.',
    "indication": 'Eine wunderbare Heiterkeit hat meine ganze Seele eingenommen, gleich den süßen Frühlingsmorgen, die ich mit ganzem Herzen genieße. Ich bin allein und freue mich meines Lebens in dieser Gegend, die für solche Seelen geschaffen ist wie die meine. Ich bin so glücklich, mein Bester, so ganz in dem Gefühle von ruhigem Dasein versunken,',
    "evaluation": 'Es gibt im Moment in diese Mannschaft, oh, einige Spieler vergessen ihnen Profi was sie sind. Ich lese nicht sehr viele Zeitungen, aber ich habe gehört viele Situationen. Erstens: wir haben nicht offensiv gespielt. Es gibt keine deutsche Mannschaft spielt offensiv und die Name offensiv wie Bayern. Letzte Spiel hatten wir in Platz drei Spitzen: Elber, jancka und dann Zickler. Wir müssen nicht vergessen Zickler. Zickler ist eine Spitzen mehr, Mehmet eh mehr Basler. Ist klar diese Wörter, ist möglich verstehen, was ich hab gesagt? Danke. Offensiv, offensiv ist wie machen wir in Platz. Zweitens: ich habe erklärt mit diese zwei Spieler: nach Dortmund brauchen vielleicht Halbzeit Pause. Ich habe auch andere Mannschaften gesehen in Europa nach diese Mittwoch. Ich habe gesehen auch zwei Tage die Training. Ein Trainer ist nicht ein Idiot! Ein Trainer sei sehen was passieren in Platz. In diese Spiel es waren zwei, drei diese Spieler waren schwach wie eine Flasche leer! Haben Sie gesehen Mittwoch, welche Mannschaft hat gespielt Mittwoch?',
    "suggestion": 'Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes. Wer würde ihm schon folgen, spät in der Nacht und dazu noch in dieser engen Gasse mitten im übel beleumundeten Hafenviertel? Gerade jetzt, wo er das Ding seines Lebens gedreht hatte und mit der Beute verschwinden wollte! Hatte einer seiner zahllosen Kollegen dieselbe Idee gehabt, ihn beobachtet und abgewartet, um ihn nun um die Früchte seiner Arbeit zu erleichtern? Oder gehörten die Schritte hinter ihm zu einem der unzähligen Gesetzeshüter dieser Stadt, und die stählerne Acht um seine Handgelenke würde gleich zuschnappen? Er konnte die Aufforderung stehen zu bleiben schon hören. Gehetzt sah er sich um.'
  },
  "error": null,
  "errorCode": null
};



