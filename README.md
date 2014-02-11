SwipePanel
==========

A gesture enabled page control for WinRT.

SwipePanel allows 'pages' to be added to a container, which may be navigated by mouse or touch swipe gestures. The container shows the currently selected page as a highlighted dot in a pager control (which may be styled using CSS).

Each page of the control can either be defined in markup, or injected at runtime.

The control has 2 simple properties:

```
.pageIndex - The currently selected page (0-n). This property may be read or set.
.pageCount - The total number of pages in the container. This property is read-only.
``` 

The control has 1 method:

```
.addPage(x) - Adds a page to the container. The page (x) must be a <div> element
```

See SwipePanel.sln for a WinJS demo that shows the control in action.
