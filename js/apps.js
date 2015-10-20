/*
 * Alphascreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20151019
 */
requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'Zepto': ['zepto.min'],
        'underscore': ['underscore-min']
    },
    shim: { //TODO: underscore es innecesario
        'underscore': {
            exports: '_',
            deps: ['Zepto']
        }
    }
});

require(["Zepto", 'underscore'], function(Zepto, _) {

    // basic vars
    var parent = $('#apps');
    var settings = $('#menu_settings');
    const LONG_PRESS_TIMEOUT = 600;
    var iconMap = new WeakMap();

    /* CONFIG */


    var x = 2; //default icon columns key value
    var config = {};

    config.empty_letters = true;
    config.columns = [];
    config.columns[2] = 65;
    config.columns[3] = 35;


    /* END CONFIG */

    var app_status = function(state_apps, state_settings) {
        parent.css('display', state_apps);
        settings.css('display', state_settings);
    }


    /**
     * Letters section generator
     */
    var print_letter = function(l) {
        var letter = document.createElement('div');
        letter.className = 'letter';
        letter.id = l;
        letter.innerHTML = "<div>" + l + "</div>";
        letter.setAttribute("name", l);
        parent.append(letter);
        if (config.empty_letters) {
            letter.style.display="none";
        }
    }

    /**
     * Renders the icon to the container.
     */
    var render = function(icon) {

        var name = icon.app.manifest.name;
        var wordname = name.split(" ");
        var firstchar = name.charAt(0);
        //document.getElementById(firstchar).innerHTML = ""; //FIXME



        var tile = document.createElement('div');
        tile.className = 'tile';
        tile.className += ' icon_' + wordname[0];
        tile.style.background = 'url(' + icon.icon + ') center/' + config.columns[x] + '% no-repeat';
        tile.style.width = (2 == x) ? "125px" : "95px";

        if (_.isEmpty($('.'+ 'icon_' + wordname[0])))  $('#' + firstchar).append(tile);
        if (config.empty_letters) {
            $('#' + firstchar).show(); //FIXME zepto show() is very slow :(
        }
        iconMap.set(tile, icon);
    }

    /* fires up the painting */
    var start = function() {

            $('.tile').remove();
            $('.letter').remove();
            $('#settings').remove();

            for (z = 65; z < 91; z++) {
                var l = String.fromCharCode(z);
                print_letter(l);
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

            // end options buttons

            app_status("block", "none");

        } //end start


    /**
     * Add an event listener to launch the app on click.
     */
    window.addEventListener('click', e => {
        var i = iconMap.get(e.target);
        if (i) i.launch();
        else {
            //console.log(e.explicitOriginalTarget.data);


            if (e.target.id == "btn_config__cancel") {
                app_status("block", "none");
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

            // scrollbar
            if (undefined != e.explicitOriginalTarget.data) {
                if ( $('#' +e.explicitOriginalTarget.data).offset().top ) {
                    var letter_offset = $('#' +e.explicitOriginalTarget.data).offset().top;

                    $('#scrollbar').css('marginTop', letter_offset);
                }

            }
        }
    }); //end window event 'click'

    //settings longpress event
    window.addEventListener('contextmenu', function(){
        app_status("none", "block");
    }, true); //end settings event 'longpress'


    start();
});
