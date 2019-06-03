$(function () {
    var App = {
        init: function () {
            var self = this;
            Quagga.init(this.state, function (err) {
                if (err) {
                    return self.handleError(err);
                }
                App.attachListeners();
                Quagga.start();
            });
        },
        handleError: function (err) {
            console.log(err);
        },
        initCameraSelection: function () {
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

            return Quagga.CameraAccess.enumerateVideoDevices()
                .then(function (devices) {
                    function pruneText (text) {
                        return text.length > 30 ? text.substr(0, 30) : text;
                    }
                });
        },
        attachListeners: function () {
            var self = this;

            self.initCameraSelection();
            $(".controls").on("click", "button.stop", function (e) {
                e.preventDefault();
                Quagga.stop();
            });
        },
        detachListeners: function () {
            $(".controls").off("click", "button.stop");
            $(".controls .reader-config-group").off("change", "input, select");
        },
        setState: function (path, value) {
            var self = this;
            if (path.startsWith('settings.')) {
                var setting = path.substring(9);
                return self.applySetting(setting, value);
            }
            console.log(JSON.stringify(self.state));
            App.detachListeners();
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
                    // width: { min: 640 },
                    // height: { min: 480 },
                    facingMode: "environment",
                    aspectRatio: { min: 1, max: 2 }
                }
            },
            locator: {
                patchSize: "large",
                // patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers: [ {
                    format: "upc_reader",
                    // format: "code_128_reader",
                    config: {}
                } ]
            },
            locate: true
        },
        lastResult: null
    };

    App.init();

    // Quagga.onProcessed(function (result) {
    //     var drawingCtx = Quagga.canvas.ctx.overlay,
    //         drawingCanvas = Quagga.canvas.dom.overlay;
    //     if (result) {
    //         if (result.boxes) {
    //             drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
    //             result.boxes.filter(function (box) {
    //                 return box !== result.box;
    //             }).forEach(function (box) {
    //                 Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
    //             });
    //         }
    //         if (result.box) {
    //             Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
    //         }
    //         if (result.codeResult && result.codeResult.code) {
    //             Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
    //         }
    //     }
    // });

    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        Quagga.stop();
        if (App.lastResult !== code) {
            App.lastResult = code;
            $("#query").val(code);
            $("#container").css('display', 'none');
        }
    });

});