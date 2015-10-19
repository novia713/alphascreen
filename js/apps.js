/*
 * Alphascreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20151017
 */
(function() {

    // Apps container
    var parent   = document.getElementById('apps');
    var settings = document.getElementById('menu_settings');
    var iconMap = new WeakMap();

    /* CONFIG */


    var x = 2; //default icon columns key value
    var config = {};

    config.empty_letters = true;
    config.columns = [];
    config.columns[2]=65;
    config.columns[3]=35;


    /* END CONFIG */




    var start = function() {
        console.log(x);
        parent.innerHTML = "";

        var skull = document.createElement('span');
        skull.id = "settings";
        skull.innerHTML = "☠";
        parent.appendChild(skull);


        app_status("block", "none");
        /**
         * Letters section generator
         */
        Array.apply(0, Array(26)).map(function(x, y) {
            var l = String.fromCharCode(y + 65);
            var letter = document.createElement('div');
            letter.className = 'letter';
            letter.id = l;
            letter.innerHTML = "<div>" +l + "</div>";
            letter.setAttribute("name", l);
            if (config.empty_letters) {
                letter.style.display = "none";
            }
            parent.appendChild(letter);
        });


        /**
         * Renders the icon to the container.
         */
        function render(icon) {

            var name = icon.app.manifest.name;
            var wordname = name.split(" ");
            var firstchar = name.charAt(0);
            var tile = document.createElement('div');

            tile.className = 'tile';
            tile.className += ' icon_' + wordname[0];
            tile.style.background = 'url(' + icon.icon + ') center/'+ config.columns[x]+'% no-repeat';
            tile.style.width = (2 == x)? "125px" : "95px";

            document.getElementById(firstchar).appendChild(tile);
            document.getElementById(firstchar).style.display = "block";
            iconMap.set(tile, icon);
        }

        /**
         * Fetch all apps and render them.
         */

        FxosApps.all().then(icons => {
            icons.forEach(render);

        });


        //options buttons
        if (config.empty_letters == true) {
            document.getElementById('btn_config__hide_empty_letters').disabled = true;
            document.getElementById('btn_config__show_empty_letters').disabled = false;
        }
        if (config.empty_letters == false) {
            document.getElementById('btn_config__show_empty_letters').disabled = true;
            document.getElementById('btn_config__hide_empty_letters').disabled = false;
        }

        if (2 == x) {
            document.getElementById('btn_config__icons_2_columns').disabled = true;
            document.getElementById('btn_config__icons_3_columns').disabled = false;
        }

        if (3 == x) {
            document.getElementById('btn_config__icons_2_columns').disabled = false;
            document.getElementById('btn_config__icons_3_columns').disabled = true;
        }
    }

    var app_status = function(state_apps, state_settings){
        parent.style.display = state_apps;
        settings.style.display = state_settings;
    }

    /**
     * Add an event listener to launch the app on click.
     */
    window.addEventListener('click', e => {
        var i = iconMap.get(e.target);
        if (i) i.launch();
        else {
            console.log(e.target.id);
            //open settings
            if (e.target.id == "settings") {
                app_status("none","block");
            }

            if (e.target.id == "btn_config__hide_empty_letters") {
                config.empty_letters = true;
                start();
            }

            if (e.target.id == "btn_config__show_empty_letters") {
                config.empty_letters = false;
                start();
            }

            if (e.target.id == "btn_config__icons_2_columns") {
                x = 2;
                start();
            }

            if (e.target.id == "btn_config__icons_3_columns") {
                x = 3;
                start();
            }
/*
 *          //scrollbar
            var scroll_height = document.getElementById('scrollbar').scrollHeight;

            document.getElementById('scrollbar').style.marginTop = (scroll_height + e.clientY) + 'px';

            console.log("clientY: " + e.clientY);
            console.log("scroll_height: " + scroll_height);
            console.log(document.getElementById('scrollbar').style.marginTop);
            console.log(e);
*/
        }
    });


    start();

}());
