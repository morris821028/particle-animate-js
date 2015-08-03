# particle-animate-js

[Demo](http://morris821028.github.io/particle-animate-js/)

## Usage ##

include js

```
<script src="https://code.jquery.com/jquery-1.10.2.js"></script>
<script src="./js/particle-animate.js"></script>
```

create canvas tag

```
<canvas id="partdem" width="1024px;" height="768px;"></canvas>
```

then, call it.

```
<script>
    $(document).ready(function() {
        $('#partdem').partdem({caption: ['http://i.imgur.com/29RXJrX.jpg', '今すぐ キミに会いに行こう', '此刻我就去見你', 'END']});
    });
</script>
```

## reference ##

* [whxaxes/canvas-test](https://github.com/whxaxes/canvas-test)
* [WAxes - simple particle tutorial](http://www.cnblogs.com/axes/p/3500655.html)