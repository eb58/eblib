/* global moment, auftrag, valuelists, icdUtils, gIcddata, _, servicerenderers */

const listUtils = {
  getListObjectById: function getListObjectById(list, id){
    return _.find(list, function (o){
      return o.value === Number(id);
    });
  },
  getListObjectByCode: function getListObjectByCode(list, code){
    return _.find(list, function (o){
      return '' + o.code === '' + code;
    });
  },
  mapper: function (list, idString){
    const ret = {
      get: function (){
        const id = Number(this.auftrag[idString]);
        const x = listUtils.getListObjectById(list, id);
        return x ? x.code : '';
      },
      set: function (newValue){
        const x = listUtils.getListObjectByCode(list, newValue);
        this.auftrag[idString] = x ? x.value : -1;
      }
    };
    return ret;
  }
};

function getFrist(date){
  const today = moment();
  const diff = moment(date, 'DD.MM.YYYY').diff(today);
  return Math.floor(moment.duration(diff).asDays());
}

function countServiceRenderers(x){
  return x.reduce(function (acc, o){
    return (acc[o.servicerenderertype.toLowerCase()]++, acc)
  }, {
    leistungserbringer: 0,
    krankenhaus: 0,
    sanitätshaus: 0,
    pflegeeinrichtung: 0
  })
}

function computeAvailableServicerendererTypes(servicerendererTypes, servicerenderersCounter){
  const maxServiceRenderersForType = Object.freeze({
    leistungserbringer: 6,
    krankenhaus: 1,
    sanitätshaus: 1,
    pflegeeinrichtung: 1
  })
  return servicerendererTypes.filter(function (o){
    const v = o.value.toLowerCase()
    return servicerenderersCounter[v] < maxServiceRenderersForType[v];
  });
}

$(document).ready(function (){
  let i = 0;
  console.log(auftrag);

  $('#cbReadonly').on('change', function (){
    const readonly = $('#cbReadonly').prop('checked');
    $('input').prop('disabled', readonly);
    $('textarea').prop('disabled', readonly);
    $('.sel').selectmenu().selectmenu(readonly ? 'disable' : 'enable');
    $('.readonly').prop('disabled', true);
    $('#cbReadonly').prop('disabled', false);
  });

  const selectedServicerendererId = servicerenderers.find(function (o){
    return o.selected
  }).servicerendererid;

  const servicerenderersCounter = countServiceRenderers(servicerenderers)
  const servicerendererTypes = computeAvailableServicerendererTypes(valuelists.servicerendererTypes, servicerenderersCounter);
  const selectedServicerendererType = servicerendererTypes.length > 0 ? servicerendererTypes[0].value : undefined;

  const vue = new Vue({
    el: '#app',
    data: {
      readonly: false,
      auftrag: auftrag,
      valuelists: valuelists,
      servicerenderers: servicerenderers,
      selectedServicerendererId: selectedServicerendererId,
      allServicerendererTypes: valuelists.servicerendererTypes,
      servicerendererTypes: servicerendererTypes,
      selectedServicerendererType: selectedServicerendererType,
      servicerenderersCounter: servicerenderersCounter,
    },
    computed: {
      participantVGA: function (){
        const x = auftrag['participants'].find(o => o['participant-type'] === 'VGA').participant;
        return x.firstname + ' ' + x.lastname;
      },
      participantWGA: function (){
        const x = auftrag['participants'].find(o => o['participant-type'] === 'WGA').participant;
        return x.firstname + ' ' + x.lastname;
      },
      participants: function (){
        return _(auftrag['participants'])
                .first(2)
                .map(function (o, idx){
                  return  idx === 0 ? o.participant.firstname + ' ' + o.participant.lastname + ',' : '...'
                })
                .reduce(function (acc, o){
                  return acc + o
                }, "")
      },
      auftragsbezogeneGruppe: function (){
        return _(auftrag['dynamic-group'])
                .map(function (o){
                  return o.firstname + " " + o.lastname
                })
                .reduce(function (acc, o){
                  return acc + (acc ? ', ' : '') + o
                }, "")
      },
      ansprechpartner: function (){
        const x = auftrag['applicant-contact']
        return  x.firstname + ' ' + x.name;
      },
      sfbStandort: function (){
        const name = auftrag['sfb-location-name'];
        const strasse = auftrag['sfb-location-street'];
        const plz = auftrag['sfb-location-zipcode'];
        const ort = auftrag['sfb-location-city'];
        return name + ' ' + plz + ' ' + ort + ' ' + strasse;
      },
      aktuellerBearbeiter: function (){
        return auftrag.performer.firstname + ' ' + auftrag.performer.lastname;
      },
      fristInDays: function (){
        return getFrist(auftrag['deadline-date']);
      },
      fristAblaufBeiKasseInDays: function (){
        return getFrist(auftrag['deadline-at-agency-date']);
      },
      fag: listUtils.mapper(valuelists.fags, 'reason-id'),
      fagPrec: listUtils.mapper(valuelists.fagsPrecision, 'reason-spec-id'),
      gutachtenart: listUtils.mapper(valuelists.gutachtenarten, 'expertise-type-id'),
      gutachtenartPrec: listUtils.mapper(valuelists.gutachtenartenPrecision, 'expertise-type-spec-id'),
      ordercode: listUtils.mapper(valuelists.ordercodes, 'ordercode-id'),
      erledigungsart: listUtils.mapper(valuelists.erledigungsarten, 'result-category-id'),
      erledigungsort: listUtils.mapper(valuelists.erledigungsorte, 'location-id'),
      ergebnisse: listUtils.mapper(valuelists.results, 'result-id'),
      icd: {
        get: function (){
          const icdCodeId = Number(this.auftrag["icd-code-id"]);
          const x = icdUtils.getIcdCodeObjectById(icdCodeId);
          return x ? x.code : '';
        },
        set: function (newValue){
          const x = icdUtils.getIcdCodeObjectByCode(newValue);
          this.auftrag['icd-code-id'] = x ? x.id : '';
        }
      },
      icdText: function (){
        const icdCodeId = Number(this.auftrag["icd-code-id"]);
        const x = icdUtils.getIcdCodeObjectById(icdCodeId);
        return x ? x.text : '';
      },
      registrationUsername: function (){
        return auftrag["registration-user-name"].firstname + " " + auftrag["registration-user-name"].lastname;
      },
    },
    methods: {
      showAnsprechpartner: function (ansprechpartner){
        alert('Ansprechpartner ' + JSON.stringify(ansprechpartner));
      },
      openDlgIcd: function (){
        dlgIcd(gIcddata, function (code, text, id){
          auftrag['icd-code-id'] = id;
          return true;
        }, {icdCode: $('#icdCode').val()});
      },
      showServiceRenderer: function (servicerenderer){
        alert('ServiceRenderer' + JSON.stringify(servicerenderer));
      },
      selectServicerendererAsPreferred: function (event){
        console.log(event.target.value);
        const selectedServicerendererId = Number(event.target.value);
        this.servicerenderers.forEach(function (servicerenderer){
          servicerenderer.selected = servicerenderer.servicerendererid === selectedServicerendererId
        })
      },
      addServicerenderer: function (){
        console.log(this.selectedServicerendererType)
        const name = this.selectedServicerendererType + '-' + i++ 
        this.servicerenderers.push({
          name: name,
          shortname: name,
          servicerenderertype: this.selectedServicerendererType,
        })
        const servicerenderersCounter = countServiceRenderers(this.servicerenderers)
        this.servicerendererTypes = computeAvailableServicerendererTypes(this.allServicerendererTypes, servicerenderersCounter);
        this.selectedServicerendererType = this.servicerendererTypes.length > 0 ? this.servicerendererTypes[0].value : undefined;
      },
      deleteServicerenderer: function (servicerenderer){
        console.log(servicerenderer)
        this.servicerenderers = this.servicerenderers.filter(function(o){
          return o.name !== servicerenderer.name
        });
        const servicerenderersCounter = countServiceRenderers(this.servicerenderers)
        this.servicerendererTypes = computeAvailableServicerendererTypes(this.allServicerendererTypes, servicerenderersCounter);
        // hack for refreshing List of types!!
        this.selectedServicerendererType = undefined;
        setTimeout(()=> {
          this.selectedServicerendererType = this.servicerendererTypes.length > 0 ? this.servicerendererTypes[0].value : undefined;
        },0)
      },
    },
  })



})

