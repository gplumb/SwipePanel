// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    /*
     * Simple dialog method to show how clickable controls can be
     * activated within a SwipePanel
     */
    app.showDialog = function (text)
    {
        var _dialog = new Windows.UI.Popups.MessageDialog(text);
        _dialog.showAsync();
    }

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            args.setPromise(WinJS.UI.processAll().then(function()
            {
                document.getElementById('button01').onclick = function ()
                {
                    var _swipePanel = document.getElementById('swipePanel').winControl;
                    _swipePanel.pageIndex = 0;
                };

                document.getElementById('button02').onclick = function ()
                {
                    var _swipePanel = document.getElementById('swipePanel').winControl;
                    _swipePanel.pageIndex = _swipePanel.pageCount - 1;
                };

                document.getElementById('button03').onclick = function ()
                {
                    var _newDiv = document.createElement("div");
                    var _swipePanel = document.getElementById('swipePanel').winControl;

                    _newDiv.innerText = "Panel " + (_swipePanel.pageCount + 1);
                    _swipePanel.addPage(_newDiv);
                };
            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
        document.getElementById('button01').onclick = null;
        document.getElementById('button02').onclick = null;
        document.getElementById('button03').onclick = null;
    };

    app.start();
})();
