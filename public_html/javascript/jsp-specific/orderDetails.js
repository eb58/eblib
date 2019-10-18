/* global moment, auftrag, valuelists, icdUtils, gIcddata, _, servicerenderers, ajaxFunctions, top, valueLists, dlgMode, valueListsParent */
valueLists = valueLists || Object.assign( {ProductReasonList:parent.ProductReasonList}, top.valueLists, parent.valueLists );

function getFristAsDays(date) {
    const today = moment();
    const diff = moment(date, 'DD.MM.YYYY').diff(today);
    return Math.ceil(moment.duration(diff).asDays());
}

function convertParticipantsToShortString(participants) {
    if (participants.length === 0)
        return '';
    const p = participants[0].participant;
    return p.firstname + ' ' + p.lastname + (participants.length > 1 ? ' u.a.' : '')
}

const serviceRendererUtils = {
    servicerendererTypes: [
        {v: 'Leistungserbringer', txt: 'Leistungserbringer'},
        {v: 'Krankenhaus', txt: 'Krankenhaus'},
        {v: 'Sanit\u00e4tshaus', txt: 'Sanit\u00e4tshaus'},
        {v: 'Pflegeeinrichtung', txt: 'Pflegeeinrichtung'},
    ],
    loadServicerenderers: function () {
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
    },
    findSelectedServiceRenderer: function (servicerenderers) {
        return servicerenderers.find(function (o) {
            return o.selected
        });
    },
    getSelectedServicerendererId: function () {
        const selectedServicerenderer = serviceRendererUtils.findSelectedServiceRenderer(servicerenderers)
        return selectedServicerenderer ? selectedServicerenderer.servicerendererid : undefined;
    },
    countServiceRenderers: function (x) {
        return x.reduce(function (acc, o) {
            return (acc[o.servicerenderertype.toLowerCase()]++, acc)
        }, {
            leistungserbringer: 0,
            krankenhaus: 0,
            'sanit\u00e4tshaus': 0,
            pflegeeinrichtung: 0
        })
    }
    ,
    computeAvailableServicerendererTypes: function (servicerenderer) {
        const maxServiceRenderersForType = Object.freeze({
            leistungserbringer: 6,
            krankenhaus: 1,
            'sanit\u00e4tshaus': 1,
            pflegeeinrichtung: 1
        })

        const servicerenderersCounter = serviceRendererUtils.countServiceRenderers(servicerenderer)

        return serviceRendererUtils.servicerendererTypes.filter(function (o) {
            const v = o.v.toLowerCase()
            return servicerenderersCounter[v] < maxServiceRenderersForType[v];
        });
    }
}

const servicerenderers = serviceRendererUtils.loadServicerenderers()
const selectedServicerendererId = serviceRendererUtils.getSelectedServicerendererId(servicerenderers);
const availableServicerendererTypes = serviceRendererUtils.computeAvailableServicerendererTypes(servicerenderers);
const selectedServicerendererType = availableServicerendererTypes.length > 0 ? availableServicerendererTypes[0].value : undefined;

const dlgs = {
    showRefOrder: function (mode, workorderid) {
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
    },
    searchWorkorder: function () {
        $.alert('Info', 'Hier kommt die Suche hin')
    },
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
        const values = !relation ? [] : reasonprecList.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: (o.number + ' ' + o.txt),
                code: o.number
            };
        });
        return [{v: null, txt: ''}].concat(values);
    },
    computeProducts: function (auftrag, productList, productReasonList) {
        const reason = valueLists.reasonList.find(function (o) {
            return '' + o.id === '' + auftrag['reason-id']
        })
        if (!reason)
            return [{v: null, txt: '', code: ''}];
        const relation = productReasonList.find(function (x) {
            return x.srcId === '' + reason.number
        });
        const values = !relation ? [] : productList
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
        return [{v: null, txt: '', code: ''}].concat(values);
    },
    computeExpertisetypes: function (auftrag, expertisetypes, product_expertisetype_relList) {
        const relation = product_expertisetype_relList.find(function (x) {
            return x.srcId === '' + auftrag['product-id']
        });
        const values = !relation ? [] : expertisetypes.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: (o.code + ' ' + o.txt),
                code: o.code
            };
        });
        return [{v: null, txt: ''}].concat(values);

        return [{v: null, txt: '', code: ''}].concat(expertisetypes);
    },
    computeExpertisetypesSpec: function (auftrag, expertisetypes, expertisetype_spec_relList) {
        const relation = expertisetype_spec_relList.find(function (x) {
            return x.srcId === '' + auftrag['expertise-type-id']
        });
        const values = !relation ? [] : expertisetypes.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: (o.code + ' ' + o.txt),
                code: o.code
            }
        })

        return [{v: null, txt: '', code: ''}].concat(values)
    },
    computeResults: function (auftrag, results, product_result_relList) {
        const relation = product_result_relList.find(function (x) {
            return x.srcId === '' + auftrag['product-id']
        });
        const values = !relation ? [] : results.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: (o.code + ' ' + o.txt),
                code: o.code
            }
        })

        return  [{v: null, txt: '', code: ''}].concat(results);
        ;
    },
    computeResultcategories: function (auftrag, resultcategory, product_resultcategory_relList) {
        const relation = product_resultcategory_relList.find(function (x) {
            return x.srcId === '' + auftrag['product-id']
        });
        const values = !relation ? [] : resultcategory.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: o.display,
                code: o.code
            }
        })
        return [{v: null, txt: '', code: ''}].concat(values);
    },
    computeLocations: function (auftrag, location, product_location_relList) {
        const relation = product_location_relList.find(function (x) {
            return x.srcId === '' + auftrag['product-id']
        });
        const values = !relation ? [] : location.filter(function (o) {
            return relation.destList.includes('' + o.v)
        }).map(function (o) {
            return {
                v: o.v,
                txt: (o.number + ' ' + o.text),
                code: o.code
            }
        })
        return [{v: null, txt: '', code: ''}].concat(values);
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

    const getSelectionValue = function (auftrag, listData, valueName) {
        return _.pluck(listData, 'v').includes(auftrag[valueName]) ? auftrag[valueName] : null;
    }

    const initOrdercodes = function (auftrag) { // Kuerzel
        $('#kuerzel').ebCombined({
            ddData: valueLists.ordercode,
            selected: auftrag['ordercode-id'],
            onChange: function (selection) {
                auftrag['ordercode-id'] = selection.v;
            },
        });
    }

    const initReasons = function (auftrag) { // FAG
        const data = listTransformers.computeReasons(auftrag, valueLists.reasonList, valueLists.ordertype_reason_relList)
        const selected = getSelectionValue(auftrag, data, 'reason-id')
        $('#fag').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['reason-id'] = selection.v;

                initReasonsPrec(auftrag)
                initProducts(auftrag)

                initResults(auftrag)
                initResultcategories(auftrag)
                initLocations(auftrag)
                initExpertisetypes(auftrag)
                initExpertisetypesPrec(auftrag)
            },
        });
    }

    const initReasonsPrec = function (auftrag) { // FAG Präzisierung
        const data = listTransformers.computeReasonPrecs(auftrag, valueLists.reasonspecList, valueLists.reason_reasonspec_relList)
        const selected = getSelectionValue(auftrag, data, 'reason-spec-id')
        $('#fagPrec').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['reason-spec-id'] = selection.v;
            },
        });
    }

    const initProducts = function (auftrag) { // Produkt
        const data = listTransformers.computeProducts(auftrag, valueLists.productList, valueLists.ProductReasonList)
        const selected = getSelectionValue(auftrag, data, 'product-id')
        const onChange = function (evt) {
            const v = evt.target.value;
            auftrag['product-id'] = _.isNumber(v) ? Number(v) : null;

            initResults(auftrag)
            initResultcategories(auftrag)
            initLocations(auftrag)
            initExpertisetypes(auftrag)
            initExpertisetypesPrec(auftrag)
        };
        const opts = {width: '300px', change: onChange}
        $('#product-list').ebdropdown(opts, data, selected);
    }

    const initExpertisetypes = function (auftrag) { // Gutachtenart
        const data = listTransformers.computeExpertisetypes(auftrag, valueLists.expertisetypes, valueLists.product_expertisetype_relList)
        const selected = getSelectionValue(auftrag, data, 'expertise-type-id')
        $('#gutachtenart').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['expertise-type-id'] = selection.v;
                auftrag['expertise-type-spec-id'] = null;
                initExpertisetypesPrec(auftrag)
            },
        });
    }

    const initExpertisetypesPrec = function (auftrag) { // Gutachtenart Präzizierung
        const data = listTransformers.computeExpertisetypesSpec(auftrag, valueLists.expertisetypesspec, valueLists.expertisetype_spec_relList)
        const selected = getSelectionValue(auftrag, data, 'expertise-type-spec-id')
        $('#gutachtenartPrec').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['expertise-type-spec-id'] = selection.v;
            },
        });
    }

    const initResultcategories = function (auftrag) { // Erledigungsart
        const data = listTransformers.computeResultcategories(auftrag, valueLists.resultcategories, valueLists.product_resultcategory_relList)
        const selected = getSelectionValue(auftrag, data, 'result-category-id')
        $('#erledigungsart').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['result-category-id'] = selection.v;
            },
        });
    }

    const initLocations = function (auftrag) { // Erledigungsort
        const data = listTransformers.computeLocations(auftrag, valueLists.resultlocations, valueLists.product_location_relList)
        const selected = getSelectionValue(auftrag, data, 'location-id')
        $('#erledigungsort').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['location-id'] = selection.v;
            },
        });
    }

    const initResults = function (auftrag) { // Ergebnis
        const data = listTransformers.computeResults(auftrag, valueLists.results, valueLists.product_result_relList)
        const selected = getSelectionValue(auftrag, data, 'result-id')
        $('#ergebnis').ebCombined({
            ddData: data,
            selected: selected,
            onChange: function (selection) {
                auftrag['result-id'] = selection.v;
            },
        });
    }

    const initCompetencecenters = function (auftrag) { // Beratungsstellen
        const data = valueLists.competencecenterList
        const selected = getSelectionValue(auftrag, data, 'competent-helpdesk-id')
        const onChange = function (evt) {
            const v = evt.target.value;
            auftrag['competent-helpdesk-id'] = _.isNumber(v) ? Number(v) : null;
        };
        $('#beratungsstellen').ebdropdown({width: '300px', change: onChange}, data, selected);
    }

    initOrdercodes(auftrag)
    initReasons(auftrag)
    initReasonsPrec(auftrag)
    initExpertisetypes(auftrag)
    initExpertisetypesPrec(auftrag)
    initProducts(auftrag)
    initResults(auftrag)
    initResultcategories(auftrag)
    initLocations(auftrag)
    initExpertisetypes(auftrag)
    initCompetencecenters(auftrag)

    new Vue({
        el: '#app',
        data: {
            readonly: readonly,
            auftrag: auftrag,
            servicerenderers: servicerenderers,
            selectedServicerendererId: selectedServicerendererId,
            allServicerendererTypes: serviceRendererUtils.servicerendererTypes,
            servicerendererTypes: availableServicerendererTypes,
            selectedServicerendererType: selectedServicerendererType,
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
                return getFristAsDays(auftrag['deadline-date']);
            },
            fristAblaufBeiKasseInDays: function () {
                return getFristAsDays(auftrag['deadline-at-agency-date']);
            },
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
                setTimeout(function () {
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