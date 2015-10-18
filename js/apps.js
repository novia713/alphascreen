/*
 * Alphascreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20151017
 */
(function() {
    // Apps container
    var parent = document.getElementById('apps');

    var iconMap = new WeakMap();



    /**
     * Letters section generator
     */
    Array.apply(0, Array(26)).map(function(x, y) {
        var l = String.fromCharCode(y + 65);
        var letter = document.createElement('div');
        letter.className = 'letter';
        letter.id = l;
        letter.innerHTML = l;
        letter.setAttribute("name", l);
        // by default all letters are invisible,
        // we make them visible if have icons afterwards
        letter.style.display = "none";
        parent.appendChild(letter);
    });


    /**
     * Renders the icon to the container.
     */
    function render(icon) {
        var name = icon.app.manifest.name;
        var firstchar = name.charAt(0);
        var tile = document.createElement('div');

        tile.className = 'tile';
        tile.style.background = 'url(' + icon.icon + ') center/90% no-repeat';
        //FIXME
        //tile.innerHTML = "<center><b class='appname'>" + name + "</b></center>";
        document.getElementById(firstchar).appendChild(tile);
        document.getElementById(firstchar).style.display = "block"
        iconMap.set(tile, icon);
    }

    /**
     * Fetch all apps and render them.
     */
    FxosApps.all().then(icons => {

        icons.forEach(render);
    });


    /**
     * Add an event listener to launch the app on click.
     */
    window.addEventListener('click', e => {
        var i = iconMap.get(e.target);
        if (i) i.launch();
        else { //scrollbar

            var scroll_height = document.getElementById('scrollbar').scrollHeight;

            document.getElementById('scrollbar').style.marginTop = (scroll_height + e.clientY) + 'px';
/*
            console.log("clientY: " + e.clientY);
            console.log("scroll_height: " + scroll_height);
            console.log(document.getElementById('scrollbar').style.marginTop);
            console.log(e);
*/
        }
    });

}());
