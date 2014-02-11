(function ()
{
    "use strict";


    /*
     * Namespace: gplumb
     */
    WinJS.Namespace.define("gplumb",
    {
        /*
         * Class: A gesture enabled page control for WinRT
         */
        SwipePanel: WinJS.Class.define(function (element, options)
        {
            this._init(element);
            this._initEvents();
            this._buildVisualTree();
        },
        {
            /*
             * Public: The current page index
             */
            pageIndex:
            {
                get: function ()
                {
                    return this._pageIndex;
                },
                set : function(value)
                {
                    this._setPageIndex(value, true);
                },
                enumerable: true,
            },


            /*
             * Public: The total number of added pages
             */
            pageCount:
            {
                get: function ()
                {
                    return this._pages.length;
                },
                enumerable: true,
            },


            /*
             * Initialize the basics of this control
             */
            _init: function (element)
            {
                // Initialize the owning element nicely
                this.element = element || document.createElement("div");
                this.element.winControl = this;
                this.element.className = 'swipePanel';

                this._pageIndex = 0;
                this._pages = [];
                this._indicators = [];
                this._swipeManager = new gplumb.SwipeManager();
                this._swipeManager.swipeThreshold = 10;
            },


            /*
             * Private: Initialize this controls' events
             */
            _initEvents: function ()
            {
                this._events = [];

                this._events['swipe'] = function (e)
                {
                    this._onSwiped(e);
                }
                .bind(this);

                this._events['resize'] = function (e)
                {
                    this.updateLayout(e);
                }
                .bind(this);

                // Detect control resizing
                window.addEventListener('resize', this._events['resize']);
            },


            /*
             * Private: Sets the page index to the given value
             */
            _setPageIndex: function(value, animate)
            {
                if (this._isNumber(value) === true)
                {
                    if (value >= 0 && value < this._pages.length)
                    {
                        // Update css styles
                        this._indicators[this._pageIndex].className = 'swipePanelUnselected';
                        this._indicators[value].className = 'swipePanelSelected';

                        // Update the page selection
                        this._pageIndex = value;

                        if (animate === true)
                        {
                            var anim = WinJS.UI.Animation.createRepositionAnimation(this._content);
                            this._updateSelection();
                            anim.execute();
                        }
                        else
                        {
                            this._updateSelection();
                        }
                    }
                }
            },


            /*
             * Private: Build the visual tree for this control
             */
            _buildVisualTree: function ()
            {
                var pages = [];

                // Have any pages been added declaratively?
                if (this.element.hasChildNodes() === true)
                {
                    for(var index = 0; index < this.element.children.length; index++)
                    {
                        var currentElement = this.element.children[index];

                        if (currentElement.tagName === 'DIV')
                        {
                            pages.push(currentElement.cloneNode(true));
                        }
                    }

                    // Clean up contents
                    this.element.innerHTML = '';
                }

                var table = document.createElement("table");
                table.cellPadding = "0";
                table.cellSpacing = "0";
                table.className = 'swipePanel';

                var topRow = document.createElement("tr");
                topRow.style.width = '100%';
                topRow.vAlign = 'top';

                var topCell = document.createElement("td");
                this._container = document.createElement("div");
                this._container.style.width = '100%';
                this._container.style.overflow = 'hidden';
                
                this._content = document.createElement('div');
                this._content.style.width = '100%';
                this._content.style.height = '100%';
                this._content.style.position = 'relative';

                this._container.appendChild(this._content);
                topCell.appendChild(this._container);
                topRow.appendChild(topCell);

                var bottomRow = document.createElement("tr");
                bottomRow.className = "swipePanelPager";

                this._pagerParent = document.createElement("td");
                bottomRow.appendChild(this._pagerParent);

                this._pager = document.createElement('div');
                this._pager.style.width = '100%';
                this._pager.style.height = '100%';
                this._pager.style.textAlign = 'center';
                this._pagerParent.appendChild(this._pager);

                table.appendChild(topRow);
                table.appendChild(bottomRow);
                this.element.appendChild(table);
                this._pagerHeight = bottomRow.clientHeight;

                // Indicates no pages (default)
                this._addPageIndicator(false);

                // Hook up swipe events
                this._swipeManager.addElement(this.element);
                this._swipeManager.addEventListener('swipe', this._events['swipe']);

                // Re-add any declarative content
                if (pages.length > 0)
                {
                    for (var index = 0; index < pages.length; index++)
                    {
                        // Add the page
                        this.addPage(pages[index]);
                    }

                    // Select the last added page
                    this._setPageIndex(0, false);
                }
            },


            /*
             * Private: Add a page indicator
             */
            _addPageIndicator : function(isSelected)
            {
                var pager = document.createElement("div");
                pager.className = (isSelected === true) ? 'swipePanelSelected' : 'swipePanelUnselected';

                this._pager.appendChild(pager);
                this._indicators.push(pager);
            },


            /*
             * Private: Is the given value a number?
             */
            _isNumber: function (number)
            {
                return !isNaN(parseFloat(number)) && isFinite(number);
            },


            /*
             * Public: Add a page to the panel
             */
            addPage: function(element)
            {
                if (element && element.tagName && element.tagName === 'DIV')
                {
                    if (this._pages.length === 0)
                    {
                        this._indicators[0].className = 'swipePanelSelected';
                    }
                    else
                    {
                        this._content.style.width = (this.element.clientWidth * (this._pages.length + 1)) + 'px';
                        this._addPageIndicator(false);
                    }

                    element.style.width = this.element.clientWidth + 'px';
                    element.style.height = this.element.clientHeight + 'px';
                    element.style.overflow = 'hidden';
                    element.style.zIndex = (new Number(this.element.style.zIndex) + this._pages.length + 1);
                    element.style.cssFloat = 'left';

                    this._content.appendChild(element);
                    this._pages.push(element);
                }
            },


            /*
             * Private: Update the layout of this control
             */
            updateLayout: function ()
            {
                // Resize containers
                this._container.style.height = (this.element.clientHeight - this._pagerParent.clientHeight) + 'px';
                this._content.style.width = (this.element.clientWidth * this._pages.length) + 'px';
                this._updateSelection();

                // Resize and re-layout child pages
                for (var index = 0; index < this._pages.length; index++)
                {
                    this._pages[index].style.left = (this.element.clientWidth * index) + 'px';
                    this._pages[index].style.width = (this.element.clientWidth) + 'px';
                    this._pages[index].style.height = (this.element.clientHeight) + 'px';
                }
            },


            /*
             * Private: Update control offsets
             */
            _updateSelection: function (updatePager)
            {
                this._content.style.left = '-' + (this._pageIndex * this.element.clientWidth) + 'px';
            },


            /*
             * Private: Fired when a swipe occurs
             */
            _onSwiped : function(e)
            {
                if (e.detail.direction === 0)
                {
                    this._pageNext();
                }
                else
                {
                    this._pagePrev();
                }
            },


            /*
             * Private: Move to the next page
             */
            _pageNext: function()
            {
                if (this._pageIndex < this._pages.length - 1)
                {
                    this._pageIndex++;
                    var anim = WinJS.UI.Animation.createRepositionAnimation(this._content);
                    this._content.style.left = '-' + (this.element.clientWidth * this._pageIndex) + 'px';
                    anim.execute();

                    this._indicators[this._pageIndex].className = 'swipePanelSelected';
                    this._indicators[this._pageIndex - 1].className = 'swipePanelUnselected';
                }
            },


            /*
             * Private: Move to the previous page
             */
            _pagePrev: function()
            {
                if (this._pageIndex > 0)
                {
                    this._pageIndex--;
                    var anim = WinJS.UI.Animation.createRepositionAnimation(this._content);
                    this._content.style.left = '-' + (this.element.clientWidth * this._pageIndex) + 'px';
                    anim.execute();

                    this._indicators[this._pageIndex].className = 'swipePanelSelected';
                    this._indicators[this._pageIndex + 1].className = 'swipePanelUnselected';
                }
            },


            /*
             * Public: Clean up
             */
            dispose: function ()
            {
                window.removeEventListener('resize', this._events['resize']);
                this._swipeManager.removeEventListener('swipe', this._events['swipe']);
                this._swipeManager.dispose();
            },
        },
        {
        }),

    });


    /*
     * Event mixin
     */
    WinJS.Class.mix(gplumb.SwipePanel, WinJS.Utilities.eventMixin);
})();