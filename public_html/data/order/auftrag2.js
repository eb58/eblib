const auftrag = {
  "workorder-id": 567,
  "is-priority": true,
  "is-special-case": true,
  "is-prg": true,
  "is-bthg": true,
  "is-bthg-plus": true,
  "ordercode-id": 5,
  "insuredperson": {
    "insuredpersonid": 0,
    "insuranceno": "1234579",
    "firstname": "Hertha",
    "lastname": "Domin",
    "dateofbirth": "26.09.1934"
  },
  "date-incoming": "25.08.2019",
  "applicant": {
    "applicantid": 456,
    "name": "AOK Bayern",
    "shortname": "Aok Wzl",
    "ikNumber": 78909123,
    "organisationunit": "Organisationseinheit",
    "docentryinfo": true
  },
  "applicant-contact": {
    "applicant-contact-id": 890,
    "additional-information": "Zusatzinfo",
    "branch-office-no": "zweigstellennummer",
    "branch-office": "Zweigstelle",
    "name": "Huber",
    "firstname": "Heinz",
    "email": "some@email.address",
    "fax": "0123/FAX"
  },
  "workorder-no": "AKZ",
  "orga-nr": 789,
  "additional-information": "some additional information",
  "sfb-location-name": "SFB",
  "sfb-location-street": "Zehntwerderweg 171 a",
  "sfb-location-zipcode": "13469",
  "sfb-location-city": "Berlin",
  "performer": {// aktueller Bearbeiter
    "userid": "50000000000015",
    "firstname": "Mario",
    "lastname": "Mustermann",
    "email": "performer@email.address",
    "fakultaete": null,
    "zusatzbezeichnung": null,
    "inOrgunitSpecialcase": false
  },
  "process-status-id": 901,
  "cause-for-return": "returnCause",
  "reason-id": 1234,
  "reason-spec-id": 7890,
  "product-id": 5678,
  "expertise-type-id": 1,
  "expertise-type-spec-id": 2,
  "reason-hint": "Reason Hint / Erläuterung Anlass",
  "icd-code-id": 141716,
  "registration-date": "25.08.2019",
  "registration-user-name": {
    "userid": "50000000000016",
    "firstname": "Ursula",
    "lastname": "Mustermann",
    "email": "ursula.Mustermann@email.address",
    "fakultaete": null,
    "zusatzbezeichnung": null,
    "inOrgunitSpecialcase": false
  },
  "responsible-expert": {
    "userid": "50000000000015",
    "firstname": "Mario",
    "lastname": "Mustermann",
    "email": "Mustermann@email.address",
    "fakultaete": null,
    "zusatzbezeichnung": null,
    "inOrgunitSpecialcase": false
  },
  "participants": [
    {
      "participant": {
        "userid": "40000000000007",
        "firstname": "Erich",
        "lastname": "Brandl",
        "email": "participant7@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "VGA" // Verantwortlicher Gutachter
    },
    {
      "participant": {
        "userid": "40000000000000",
        "firstname": "Ein weiterer",
        "lastname": "Participant #0",
        "email": "participant0@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "AFK" // Ausführende Fachkraft
    },
    {
      "participant": {
        "userid": "40000000000008",
        "firstname": "Annika",
        "lastname": "Borgmann",
        "email": "annika.Borgmann@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "WGA" // Vorgesehener Verantwortlicher Gutachter (erster Reiter)
    },
    {
      "participant": {
        "userid": "40000000000001",
        "firstname": "Ein weiterer",
        "lastname": "Participant #1",
        "email": "participant1@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "AGA" // // Ausführender Gutachter
    },
    {
      "participant": {
        "userid": "40000000000002",
        "firstname": "Ein weiterer",
        "lastname": "Participant #2",
        "email": "participant2@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "ASS" // Assitenzkraft
    },
    {
      "participant": {
        "userid": "40000000000003",
        "firstname": "Ein weiterer",
        "lastname": "Participant #3",
        "email": "participant3@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "BGA" // Beteiligter Gutachter
    },
    {
      "participant": {
        "userid": "40000000000004",
        "firstname": "Ein weiterer",
        "lastname": "Participant #4",
        "email": "participant4@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "IAG" // Vorgesehener Gutachter (KH-Reiter)
    },
    {
      "participant": {
        "userid": "40000000000005",
        "firstname": "Ein weiterer",
        "lastname": "Participant #5",
        "email": "participant5@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "KFK" // Kodierfachkraft (KH-Reiter)
    },
    {
      "participant": {
        "userid": "40000000000006",
        "firstname": "Ein weiterer",
        "lastname": "Participant #6",
        "email": "participant6@workorder.de",
        "fakultaete": null,
        "zusatzbezeichnung": null,
        "inOrgunitSpecialcase": false
      },
      "participant-type": "VAS" // Verantwortliche Assistenzkraft
    },
  ],
  "dynamic-group": [
    {
      "userid": "30000000000001",
      "firstname": "Horst",
      "lastname": "Schlemer",
      "email": "dynamic1@workorder.de",
      "fakultaete": null,
      "zusatzbezeichnung": null,
      "inOrgunitSpecialcase": false
    },
    {
      "userid": "30000000000002",
      "firstname": "Horst",
      "lastname": "Evers",
      "email": "dynamic2@workorder.de",
      "fakultaete": null,
      "zusatzbezeichnung": null,
      "inOrgunitSpecialcase": false
    },
    {
      "userid": "30000000000003",
      "firstname": "Horst",
      "lastname": "Seehofer",
      "email": "dynamic3@workorder.de",
      "fakultaete": null,
      "zusatzbezeichnung": null,
      "inOrgunitSpecialcase": false
    }
  ],
  "release-date": null,
  "reference-id": 0,
  "result-category-id": 234,
  "location-id": 23456,
  "result-id": 34567,
  "org-id": "Organisationseinheit",
  "competent-helpdesk-id": 45678,
  "dms-upload-date": "30.09.2019",
  "ams-release-date": "30.09.2019",
  "final-date": "25.08.2019 16:35",
  "first-doc-requested": "25.08.2019 16:35",
  "last-doc-received-date": "25.08.2019",
  "target-date": "25.08.2019",
  "order-request-date": "25.08.2019",
  "reason-of-prg-delay-id": 56789,
  "prg-delay-comment": "PRG Delay Comment",
  "prg-delay-letter-date": "25.08.2019",
  "process-identifier": "Verfahrenskennung",
  "is-group-download": false,
  "deadline-date": "25.08.2019 16:35",
  "deadline-at-agency-date": "25.08.2019",
  "last-modification-date": "25.08.2019 16:35",
  "case-count": 123,
  "order-type": "kh",
  "is-dta": true,
  "result-date": "25.08.2019 16:35",
  "has-external-document": true,
  "proofed-object": {
    "id": 345,
    "text": "ProofedObjectText"
  },
  "dta-workorder-no": true,
  "applicant-remark-to-reason": true,
  "delays": [],
  "handling-costs": []
}

const servicerenderers = [
  {
    "servicerendererid": 987654,
    "name": "Kreiskankenhaus Aschaffenburg",
    "servicerenderertype": "Krankenhaus",
    "shortname": "Kreiskankenhaus A'burg",
    "delivery-config-id": 14,
    "valid": true,
    "selected": true,
    "duplicate": "NoDuplicate"
  },
  {
    "servicerendererid": 987652,
    "name": "Sanitätshaus Schulze",
    "servicerenderertype": "Sanitätshaus",
    "shortname": "Sanitätshaus Schulze",
    "delivery-config-id": 13,
    "valid": true,
    "selected": false,
    "duplicate": "NoDuplicate"
  },
  {
    "servicerendererid": 987655,
    "name": "Dr. Schulze",
    "servicerenderertype": "Leistungserbringer",
    "shortname": "Dr. Schulze",
    "delivery-config-id": 14,
    "valid": true,
    "selected": false,
    "duplicate": "NoDuplicate"
  }
]

