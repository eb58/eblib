/* global moment, auftrag, valuelists, icdUtils, gIcddata, _, servicerenderers, ajaxFunctions, top, valueLists, dlgMode, valueListsParent */
const listUtils = {
    getListObjectById: function getListObjectById(list, id) {
        return _.find(list, function (o) {
            return o.value === Number(id);
        });
    },
    getListObjectByCode: function getListObjectByCode(list, code) {
        return _.find(list, function (o) {
            return '' + o.code === '' + code;
        });
    },
    mapper: function (list, idString, callback) {
        const ret = {
            get: function () {
                callback && callback('get');
                const id = Number(this.auftrag[idString]);
                const x = listUtils.getListObjectById(list, id);
                return x ? x.code : '';
            },
            set: function (newValue) {
                callback && callback('set');
                const x = listUtils.getListObjectByCode(list, newValue);
                this.auftrag[idString] = x ? x.value : null;
            }
        };
        return ret;
    }
};

function getFrist(date) {
    const today = moment();
    const diff = moment(date, 'DD.MM.YYYY').diff(today);
    return Math.floor(moment.duration(diff).asDays());
}

function countServiceRenderers(x) {
    return x.reduce(function (acc, o) {
        return (acc[o.servicerenderertype.toLowerCase()]++, acc)
    }, {
        leistungserbringer: 0,
        krankenhaus: 0,
        'sanit\u00e4tshaus': 0,
        pflegeeinrichtung: 0
    })
}

function computeAvailableServicerendererTypes(servicerendererTypes, servicerenderersCounter) {
    const maxServiceRenderersForType = Object.freeze({
        leistungserbringer: 6,
        krankenhaus: 1,
        'sanit\u00e4tshaus': 1,
        pflegeeinrichtung: 1
    })
    return servicerendererTypes.filter(function (o) {
        const v = o.v.toLowerCase()
        return servicerenderersCounter[v] < maxServiceRenderersForType[v];
    });
}

function showRefOrder(mode, workorderid) {
    const sAction = _.template('showRefOrder.do?workorderid=<%=workorderid%>&mode=<%=mode%>&workspace=<%=mode%>')({
        workorderid: workorderid,
        mode: mode,
    });
    if (top.secWnd && !top.secWnd.closed) {
        top.secWnd.close();
    }
    top.secWnd = window.open(sAction, 'show_referenced_order', 'width=850,height=700,left=10,top=10,location=no,menubar=no,toolbar=no,dependent=yes,resizeable=no,scrollbars=no,status=no');
    if (top.secWnd)
        top.secWnd.focus();
}

function searchWorkorder() {
    $.alert('Info', 'Hier kommt die Suche hin')
}

function loadServicerenderers() {
    let servicerenderers = [];
    false && $.ajax({
        url: '/ISmed/ajax/workspace.do?action=load-servicerenderers&ajax=1',
        async: false,
        success: function (result) {
            handleAjaxResult(result, function () {
                console.log('load-servicerenderers', result.data)
                servicerenderers = result.data;
            });
        },
        error: function (a, b, c) {
            console.log('Fehler beim Laden der LEs', a, b, c);
        }
    })
    return servicerenderers;
}

function convertParticipantsToShortString(participants) {
    if (participants.length === 0)
        return '';
    const p = participants[0].participant;
    return p.firstname + ' ' + p.lastname + (participants.length > 1 ? ' u.a.' : '')
}

const listTransformers = {// Berechne Wertelisten abhängig von Auftrag
    computeReasons: function (auftrag, reasonList, ordertype_reason_relList) {
        const isDta = auftrag['is-dta'];
        const orderType = auftrag['order-type'];
        const orderTypeId = auftrag['order-type-id'];
        const isOrderTypeWb = orderType === 'wb';
        const filterDate = moment(auftrag['date-incoming'], 'DD.MM.YYYY').format('YYYY-MM-DD')

        let reasons = reasonList.filter(function (o) {
            return o.validfrom <= filterDate && filterDate <= o.validto
        });

        if (isDta) {
            if (isOrderTypeWb) {
                const relation = ordertype_reason_relList.find(function (o) {
                    return o.srcId === '' + orderTypeId
                });
                const reasonIds = relation ? relation.destList : [];
                reasons = reasonList.filter(function (o) {
                    return reasonIds.includes('' + o.id);
                });
            } else {
                reasons = !isOrderTypeWb ? reasons.filter(function (o) {
                    return o.ordertypeid === orderTypeId
                }) : reasons;
            }
        }

        reasons = reasons.map(function (o) {
            return {
                v: o.id,
                txt: (o.number + ' ' + o.text),
                code: o.number
            };
        })
        return [{v: null, txt: ''}].concat(reasons);
    },
    computeReasonPrecs: function (auftrag, reasonprecList, reason_reasonspec_relList) {
        const relation = reason_reasonspec_relList.find(function (x) {
            return x.srcId === '' + auftrag['reason-id']
        });
        const ret = !relation ? [] : reasonprecList.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: (o.number + ' ' + o.txt),
                code: o.number
            };
        });
        return [{v: null, txt: ''}].concat(ret);
    },
    computeProducts: function (auftrag, productList, productReasonList) {
        const reason = valueLists.reasonList.find(o => '' + o.id === '' + auftrag['reason-id'])
        if (!reason)
            return [{v: null, txt: '', code: ''}];


        const relation = productReasonList.find(function (x) {
            return x.srcId === '' + reason.number
        });

        const products = !relation ? [] : productList
                .filter(function (o) {
                    return relation.destList.includes(o.id)
                })
                .map(function (o) {
                    return {
                        v: o.id,
                        txt: o.name,
                        code: o.number
                    };
                });
        return [{v: null, txt: '', code: ''}].concat(products);
    },
    computeExpertisetypes: function (auftrag, expertiseTypes, product_expertisetype_relList) {
        return expertiseTypes;
    },
    computeExpertisetypesSpec: function (auftrag, expertisetypes, expertisetype_spec_relList) {
        const expertisetype = expertisetype_spec_relList.find(function (x) {
            return x.srcId === '' + auftrag['expertise-type-id']
        });
        const ret = !expertisetype ? [] : expertisetypes.filter(function (o) {
            return expertisetype.destList.includes('' + o.v)
        })
        return [{v: null, txt: '', code: ''}].concat(ret)
    },
    computeResults: function (auftrag, results, product_result_relList) {
        return results;
    },
    computeResultcategories: function (auftrag, resultcategory, product_resultcategory_relList) {
        return resultcategory.map(function (o) {
            return {
                v: o.id,
                txt: (o.number + ' ' + o.display),
                code: o.number
            };
        });
    },
    computeLocations: function (auftrag, location, product_location_relList) {
        return location.map(function (o) {
            return {
                v: o.id,
                txt: (o.number + ' ' + o.display),
                code: o.number
            };
        });
    },
}

function initAuftrag(auftrag, readonly) {

    /*
     *                                FAG (reason)     -  FAG Prec ( reason_spec )
     *                                  |
     *                               Product 
     *                                  |
     * Erledigungsart Erledigungsort Gutachtenart    Ergebnis
     *                                  |
     *                             GutachtenartPrec
     *  
     */

    const initOrdercodes = function () { // Kuerzel
        $('#kuerzel').ebCombined({
            ddData: valueLists.ordercode,
            onChange: function (selection) {
                auftrag['ordercode-id'] = selection.v;
            },
        });
    }

    const initReasons = function () { // FAG
        $('#fag').ebCombined({
            ddData: listTransformers.computeReasons(auftrag, valueLists.reasonList, valueLists.ordertype_reason_relList),
            onChange: function (selection) {
                auftrag['reason-id'] = selection.v;
                initReasonsPrec()
                initProducts()
            },
            selected: auftrag['reason-id'],
        });
    }

    const initReasonsPrec = function () {
        $('#fagPrec').ebCombined({
            ddData: listTransformers.computeReasonPrecs(auftrag, valueLists.reasonspecList, valueLists.reason_reasonspec_relList),
            onChange: function (selection) {
                auftrag['reason-spec-id'] = selection.v;
            },
            selected: auftrag['reason-spec-id'],
        });
    }

    const initExpertisetypePrec = function () {
        $('#gutachtenartPrec').ebCombined({
            ddData: listTransformers.computeExpertisetypesSpec(auftrag, valueLists.expertisetypesspec, valueLists.expertisetype_spec_relList),
            onChange: function (selection) {
                auftrag['reason-spec-id'] = selection.v;
            },
        });
    }

    const initProducts = function () {
        const x = listTransformers.computeProducts(auftrag, valueLists.productList, valueListsParent.ProductReasonList)
        $('#product-list').ebdropdown({width: '300px', }, x);
    }

    const initExpertisetype = function () { // Gutachtenart
        $('#gutachtenart').ebCombined({
            ddData: listTransformers.computeExpertisetypes(auftrag, valueLists.expertisetypes),
            onChange: function (selection) {
                auftrag['expertise-type-id'] = selection.v;
                initGutachtenartPrec()
            },
        });
    }

    const initResultcategories = function () { // Erledigungsart
        const data = listTransformers.computeResultcategories(auftrag, valueListsParent.resultcategory, valueLists.product_resultcategory_relList)
        $('#erledigungsart').ebCombined({
            ddData: data,
            onChange: function (selection) {
                auftrag['result-category-id'] = selection.v;
            },
        });
    }

    const initLocations = function () { // Erledigungsort
        const data = listTransformers.computeLocations(auftrag, valueLists.resultlocation, valueLists.product_location_relList)
        $('#erledigungsort').ebCombined({
            ddData: data,
            onChange: function (selection) {
                auftrag['location-id'] = selection.v;
            },
        });
    }

    const initResults = function () { // Ergebnis
        $('#ergebnis').ebCombined({
            ddData: listTransformers.computeResults(auftrag, valueLists.results, valueLists.product_resultRelList),
            onChange: function (selection) {
                auftrag['result-id'] = selection.v;
            },
        });
    }

    initOrdercodes()
    initReasons()
    initReasonsPrec()
    initExpertisetype()
    initExpertisetypePrec()
    initProducts()
    initResults()
    initResultcategories()
    initLocations()
    initExpertisetype()


//    valuelists.expertisetypes = listTransformers.computeExpertisetypes(auftrag, valueLists.expertisetypes);
//    valuelists.expertisetypesspec = listTransformers.computeExpertisetypesSpec(auftrag, valueLists.expertisetypesspec, valueLists.expertisetype_spec_relList);
//    valuelists.results = listTransformers.computeResults(auftrag, valueLists.results)

    const servicerenderers = loadServicerenderers();
    const selectedServicerenderer = servicerenderers.find(function (o) {
        return o.selected
    });
    const selectedServicerendererId = selectedServicerenderer ? selectedServicerenderer.servicerendererid : undefined;
    const servicerenderersCounter = countServiceRenderers(servicerenderers)
    const servicerendererTypes = computeAvailableServicerendererTypes(valuelists.servicerendererTypes, servicerenderersCounter);
    const selectedServicerendererType = servicerendererTypes.length > 0 ? servicerendererTypes[0].value : undefined;

    new Vue({
        el: '#app',
        data: {
            readonly: readonly,
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
            participantVGA: function () { // VGA = Verantwortlicher Gutachter
                const vga = auftrag['participants'].find(function (o) {
                    return o['participant-type'] === 'VGA'
                });
                return vga && vga.participant ? vga.participant.firstname + ' ' + vga.participant.lastname : '';
            },
            participantWGA: function () { // WGA = Vorgesehener Verantwortlicher Gutachter (erster Reiter)
                const wga = auftrag['participants'].find(function (o) {
                    return o['participant-type'] === 'WGA'
                });
                return wga && wga.participant ? wga.participant.firstname + ' ' + wga.participant.lastname : '';
            },
            participantsBGA: function () { // BGA = Beteiligter Gutachter 
                const bgas = auftrag['participants'].filter(function (o) {
                    return o['participant-type'] === 'BGA'
                });
                return convertParticipantsToShortString(bgas);
            },
            auftragsbezogeneGruppe: function () {
                return convertParticipantsToShortString(auftrag['dynamic-group']);
            },
            ansprechpartner: function () {
                const applicant = auftrag['applicant-contact'];
                const firstname = applicant.firstname || '';
                const name = applicant.name || '';
                return firstname + ' ' + name;
            },
            sfbStandort: function () {
                const name = auftrag['sfb-location-name'] || '';
                const strasse = auftrag['sfb-location-street'] || '';
                const plz = auftrag['sfb-location-zipcode'] || '';
                const ort = auftrag['sfb-location-city'] || '';
                return name + ' ' + plz + ' ' + ort + ' ' + strasse;
            },
            aktuellerBearbeiter: function () {
                return auftrag.performer.firstname + ' ' + auftrag.performer.lastname;
            },
            fristInDays: function () {
                return getFrist(auftrag['deadline-date']);
            },
            fristAblaufBeiKasseInDays: function () {
                return getFrist(auftrag['deadline-at-agency-date']);
            },
            gutachtenart: listUtils.mapper(valuelists.expertisetypes, 'expertise-type-id', function () {
                auftrag['expertise-type-spec-id'] = null;
                valuelists.expertisetypesspec = listTransformers.computeExpertisetypesSpec(auftrag, valueLists.expertisetypesspec, valueLists.expertisetype_spec_relList);
                setTimeout(function () {
                    $('#expertiseSpec').selectmenu('refresh');
                }, 1);
            }),
            gutachtenartPrec: listUtils.mapper(valuelists.expertisetypesspec, 'expertise-type-spec-id'),
            ordercode: listUtils.mapper(valuelists.ordercodes, 'ordercode-id'),
            erledigungsart: listUtils.mapper(valuelists.erledigungsarten, 'result-category-id'),
            erledigungsort: listUtils.mapper(valuelists.erledigungsorte, 'location-id'),
            ergebnisse: listUtils.mapper(valuelists.results, 'result-id'),
            icd: {
                get: function () {
                    const icdCodes = auftrag['icd-codes'];
                    if (icdCodes.length === 0) {
                        return ''
                    } else {
                        const icdCodeId = Number(icdCodes[0]['icd-code-id']);
                        const x = icdUtils.getIcdCodeObjectById(icdCodeId);
                        return x ? x.code : '';
                    }
                },
                set: function (code) {
                    const x = icdUtils.getIcdCodeObjectByCode(code);
                    if (x) {
                        auftrag['icd-codes'] = [{
                                'icd-code-id': x.id,
                                'icd-code-number': x.code,
                                'text': x.text,
                            }];
                    } else {
                        auftrag['icd-codes'] = [];
                    }
                }
            },
            icdText: {
                get: function () {
                    const icdCodes = auftrag['icd-codes'];
                    return  icdCodes.length > 0 ? icdCodes[0].text : '';
                },
                set: function (text) {
                    const icdCodes = auftrag['icd-codes'];
                    if (icdCodes.length === 0) {
                        auftrag['icd-codes'] = [{
                                'icd-code-id': null,
                                'icd-code-number': null,
                                'text': text,
                            }];
                    } else {
                        icdCodes[0].text = text;
                    }

                }
            },
            registrationUsername: function () {
                return auftrag['registration-user-name'].firstname + ' ' + auftrag['registration-user-name'].lastname;
            },
        },
        methods: {
            doBearbeitungszeiten: function (readonly) {
                ajaxFunctions.getBearbeitungszeiten(function (zeitdata) {
                    callDlgBearbeitungszeiten(zeitdata, readonly);
                });
            },
            openDlgIcd: function () {
                dlgIcd(icdUtils.getIcdData(), function (code, text, id) {
                    const x = icdUtils.getIcdCodeObjectById(id);
                    if (x) {
                        auftrag['icd-codes'] = [{
                                'icd-code-id': id,
                                'icd-code.number': x.code,
                                'text': x.text
                            }]
                    }
                    return true;
                }, {icdCode: $('#icdCode').val()});
            },
            showDlgAnsprechpartner: function (ansprechpartner) {
                dlgAnsprechpartner({readonly: true}, ansprechpartner)
            },
            editDlgAnsprechpartner: function (ansprechpartner) {
                const takeOver = function (ansprechpartner) {
                    auftrag['applicant-contact'] = ansprechpartner;
                    return true;
                };
                dlgAnsprechpartner({onTakeOverCallback: takeOver}, ansprechpartner)
            },
            selectBeteiligteGutachter: function () {
                const notBgas = auftrag['participants'].filter(function (participant) {
                    return participant['participant-type'] !== 'BGA' // nicht die BGAs
                });
                const bgas = auftrag['participants'].filter(function (participant) {
                    return participant['participant-type'] === 'BGA' // nur die BGAs
                });

                var callback = function (selectedBGA) {
                    const newSelectedBGAs = selectedBGA.map(function (expert) {
                        return {
                            participant: expert,
                            'participant-type': 'BGA'
                        }
                    })
                    auftrag['participants'] = notBgas.concat(newSelectedBGAs)
                    return true;
                };
                dlgSelectExperts(callback, {
                    usertypeNames: ['Gutachter'],
                    heading: 'Bitte w\u00e4hlen Sie die Gutachter aus',
                    dlgContext: 'Auftrag',
                    singleSelection: false,
                    selectedExperts: bgas
                });
            },
            deleteBeteiligteGutachter: function () {
                auftrag['participants'] = auftrag['participants'].filter(function (participant) {
                    return participant['participant-type'] !== 'BGA'
                })
            },
            showServiceRenderer: function (servicerenderer) {
                alert('ServiceRenderer' + JSON.stringify(servicerenderer));
            },
            selectServicerendererAsPreferred: function (event) {
                console.log(event.target.value);
                const selectedServicerendererId = Number(event.target.value);
                this.servicerenderers.forEach(function (servicerenderer) {
                    servicerenderer.selected = servicerenderer.servicerendererid === selectedServicerendererId
                })
            },
            addServicerenderer: (function () {
                let i = 0;
                return function () {
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
                }
            })(),
            deleteServicerenderer: function (servicerenderer) {
                console.log(servicerenderer)
                this.servicerenderers = this.servicerenderers.filter(function (o) {
                    return o.name !== servicerenderer.name
                });
                const servicerenderersCounter = countServiceRenderers(this.servicerenderers)
                this.servicerendererTypes = computeAvailableServicerendererTypes(this.allServicerendererTypes, servicerenderersCounter);
                // hack for refreshing List of types!!
                this.selectedServicerendererType = undefined;
                setTimeout(() => {
                    this.selectedServicerendererType = this.servicerendererTypes.length > 0 ? this.servicerendererTypes[0].value : undefined;
                }, 0)
            },
            saveWorkorder: function () {
                $.ajax({
                    url: '/ISmed/ajax/workspace.do?action=save-workorder-data',
                    method: 'POST',
                    data: {data: JSON.stringify(auftrag)},
                    success: function (result) {
                        handleAjaxResult(result, function () {
                            console.log(result);
                        });
                    },
                    error: function (a, b, c) {
                        console.log('Fehler bei save-workorder-data', a, b, c);
                    }
                });
            }
        },
    })
}

let readonly = false;

const setReadonly = function (readonly) {
    $('input').prop('disabled', readonly);
    $('textarea').prop('disabled', readonly);
    $('.sel').selectmenu().selectmenu(readonly ? 'disable' : 'enable');
    $('.readonly').prop('disabled', true);
    $('#cbReadonly').prop('disabled', false);
}

$(document).ready(function () {
    initAuftrag(auftrag, readonly)

    false && $.ajax({
        url: '/ISmed/ajax/workspace.do?action=load-workorder-data',
        success: function (result) {
            handleAjaxResult(result, function () {
                console.log(result.data);
                initAuftrag(result.data, readonly)
                setReadonly(readonly)
                $('body').show();
            });
        },
        error: function (a, b, c) {
            console.log('Fehler bei load-workorder-data', a, b, c);
        }
    });

    $('#cbReadonly').on('change', function () {
        setReadonly($('#cbReadonly').prop('checked'))
    });
    $('button').button();
})