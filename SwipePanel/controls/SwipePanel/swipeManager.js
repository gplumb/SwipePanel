(function ()
{
    "use strict";


    /*
     * Namespace: gplumb
     */
    WinJS.Namespace.define("gplumb",
    {
        /*
         * Handles swipe movements using Touch and Mouse gestures
         */
        SwipeManager : WinJS.Class.define(function ()
        {
            // Seems to be best trade off for mouse and touch-screen
            this.swipeThreshold = 15;

            this._handlers = [];
            this._elements = [];
            this._gestureRecognizer = null;
            this._lastElement = null;
            this._lastElementX = -1;
            this._isActive = false;

            this._initHandlers();
            this._initGestureRecognizer();
        },
        {
            /*
             * Property: Is the swipe manager processing a gesture?
             */
            isActive:
            {
                get: function ()
                {
                    return this._isActive;
                }
            },


            /*
             * Private: Initialize event handlers
             */
            _initHandlers: function ()
            {
                this._handlers['MSPointerDown'] = this._processDownEvent.bind(this);
                this._handlers['MSPointerMove'] = this._processMoveEvent.bind(this);
                this._handlers['MSPointerUp'] = this._processUpEvent.bind(this);
                this._handlers['MSPointerCancel'] = this._processDownEvent.bind(this);
            },


            /*
             * Private: Initialize the gesture recognizer
             */
            _initGestureRecognizer: function ()
            {
                this._gestureRecognizer = new Windows.UI.Input.GestureRecognizer();
                this._gestureRecognizer.gestureSettings = Windows.UI.Input.GestureSettings.crossSlide | Windows.UI.Input.GestureSettings.drag;
                this._gestureRecognizer.crossSlideHorizontally = true;

                this._gestureRecognizer.ondragging = function (e)
                {
                    this._processSwipe(e);
                }
                .bind(this);

                this._gestureRecognizer.oncrosssliding = function (e)
                {
                    this._processSwipe(e);
                }
                .bind(this);
            },


            /*
             * Private: Process a point 'down' event
             */
            _processDownEvent: function (e)
            {
                this._lastElement = e.currentTarget;
                this._lastElementX = -1;
                this._isActive = false;

                this._gestureRecognizer.completeGesture();
                this._gestureRecognizer.processDownEvent(e.currentPoint);
            },


            /*
             * Private: Process a point 'move' event
             */
            _processMoveEvent: function (e)
            {
                this._lastElement = e.currentTarget;
                this._gestureRecognizer.processMoveEvents(e.getIntermediatePoints(e.currentTarget));
            },


            /*
             * Private: Process a point 'up' event
             */
            _processUpEvent: function (e)
            {
                this._lastElement = e.currentTarget;
                this._gestureRecognizer.processUpEvent(e.currentPoint);
            },


            /*
             * Private: Assess a potential swiping action
             */
            _processSwipe: function (e)
            {
                // Keep the last element's x?
                var doAssign = true;

                // Has the position of the last known target changed?
                if (this._lastElementX > -1 && this._lastElementX != e.position.x)
                {
                    // Calculate the offset of the last and current positions
                    var offset = this._lastElementX - e.position.x;

                    // Have we past the threshold to count as a swipe?
                    if (Math.abs(offset) > this.swipeThreshold)
                    {
                        // Yes
                        if (this._isActive === false)
                        {
                            this._isActive = true;

                            // 0 = left, 1 = right
                            var detail = {
                                source: this._lastElement,
                                direction: (offset < 0) ? 1 : 0
                            };

                            this.dispatchEvent('swipe', detail);
                            doAssign = false;
                        }
                    }
                }
                
                if (doAssign === true)
                {
                    this._lastElementX = (e) ? e.position.x : -1;
                }
                else
                {
                    this._lastElementX = -1;
                }
            },


            /*
             * Private: Remove event handlers from the given element
             */
            _removeHandlers: function (element)
            {
                element.removeEventListener("MSPointerDown", this._handlers["MSPointerDown"]);
                element.removeEventListener("MSPointerMove", this._handlers["MSPointerMove"]);
                element.removeEventListener("MSPointerUp", this._handlers["MSPointerUp"]);
                element.removeEventListener("MSPointerCancel", this._handlers["MSPointerCancel"]);
            },


            /*
             * Public: Monitor the given element for swipe gestures
             */
            addElement: function (element)
            {
                if (this._elements.indexOf(element) === -1)
                {
                    this._elements.push(element);

                    element.addEventListener("MSPointerDown", this._handlers["MSPointerDown"], false);
                    element.addEventListener("MSPointerMove", this._handlers["MSPointerMove"], false);
                    element.addEventListener("MSPointerUp", this._handlers["MSPointerUp"], false);
                    element.addEventListener("MSPointerCancel", this._handlers["MSPointerCancel"], false);
                }
            },


            /*
             * Public: Stop monitoring the given element for swipe gestures
             */
            removeElement: function (element)
            {
                var index = this._elements.indexOf(element);

                if (index > -1)
                {
                    this._removeHandlers(element);
                    this._elements.splice(index, 1);
                }
            },


            /*
             * Public: Clean up this object
             */
            dispose: function ()
            {
                for (var index = 0; index < this._elements.length; index++)
                {
                    this._removeHandlers(this._elements[index]);
                }

                this._elements = [];
                this._gestureRecognizer.ondragging = null;
                this._gestureRecognizer.oncrosssliding = null;
                this._gestureRecognizer = null;
            },
        },
        {
        })
    });


    /*
     * Event mixin
     */
    gplumb.SwipeManager = WinJS.Class.mix(gplumb.SwipeManager, WinJS.Utilities.eventMixin);
})();
