// document.addEventListener('DOMContentLoaded', function () {
setTimeout(function () {
    var App = {
        init: function () {
            var self = this;
            Quagga.init(this.state, function (err) {
                if (err) {
                    return self.handleError(err);
                }
                App.initCameraSelection();
                Quagga.start();
            });
        },
        stopIfNotDisplaying: function () {
            if (document.getElementById('container').style.display = 'none') {
                Quagga.stop();
                console.log("stopped");
            }
        },
        handleError: function (err) {
            console.log(err);
        },
        initCameraSelection: function () {
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

            return Quagga.CameraAccess.enumerateVideoDevices()
        },
        setState: function (path, value) {
            var self = this;
            if (path.startsWith('settings.')) {
                var setting = path.substring(9);
                return self.applySetting(setting, value);
            }
            console.log(JSON.stringify(self.state));
            Quagga.stop();
            App.init();
        },
        inputMapper: {
            inputStream: {
                constraints: function (value) {
                    if (/^(\d+)x(\d+)$/.test(value)) {
                        var values = value.split('x');
                        return {
                            width: { min: parseInt(values[ 0 ]) },
                            height: { min: parseInt(values[ 1 ]) }
                        };
                    }
                    return {
                        deviceId: value
                    };
                }
            },
            numOfWorkers: function (value) {
                return parseInt(value);
            },
            decoder: {
                readers: function (value) {
                    if (value === 'ean_extended') {
                        return [ {
                            format: "ean_reader",
                            config: {
                                supplements: [
                                    'ean_5_reader', 'ean_2_reader'
                                ]
                            }
                        } ];
                    }
                    return [ {
                        format: value + "_reader",
                        config: {}
                    } ];
                }
            }
        },
        state: {
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: { min: 1280 },
                    height: { min: 720 },
                    facingMode: "environment",
                    aspectRatio: { min: 1, max: 2 }
                }
            },
            locator: {
                patchSize: "large",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers: [ {
                    format: "upc_reader",
                    config: {}
                }, {
                    format: "ean_8_reader",
                    config: {}
                } ]
            },
            locate: true
        },
        lastResult: null
    };

    document.getElementById("cancel").addEventListener("click", function () {
        Quagga.stop();
        $("#container").css('display', 'none');
    });

    App.init();

    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        Quagga.stop();
        if (App.lastResult !== code) {
            App.lastResult = code;
            $("#query").val(code);
            // $("#query").trigger("click");
            $("#btn-search").trigger("click");
            $("#container").css('display', 'none');
        }
    });
    // }, false);
}, 250);