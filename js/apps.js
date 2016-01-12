/**
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *          .·' H O M E S C R E E N S F O R A L L'·.  by leandro713
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *
 * Alphascreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20160111
 *
 * @author      leandro713 <leandro@leandro.org>
 * @copyright   leandro713 - 2016
 * @link        https://github.com/novia713/alphascreen
 * @license     http://www.gnu.org/licenses/gpl-3.0.en.html
 * @version     1.1
 * @date        20160111
 *
 * @see         https://github.com/mozilla-b2g/gaia/tree/88c8d6b7c6ab65505c4a221b61c91804bbabf891/apps/homescreen
 * @thanks      to @CodingFree for his tireless support and benevolent friendship
 *
 *
 */

/*
 * HOW TO DO HOMESCREENS MAGIC WITH FXOS 2.6
 * =========================================
 * 1, manifest.webapp →
 *      "type":"privileged",
 *      "permission": "homescreen-webapps-manage"
 *
 * 2. navigator.mozApps.mgmt.getAll()               // gets all the apps installed on the phone
 *
 * 3. navigator.mozApps.mgmt.getIcon(app, size)     // gets the icon of the app at the desired (more or less) size
 *
 * 4. window.URL.createObjectURL( img )             // userful for printin' the blob resulting of getIcon()
 *
 *
 **/

requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'Zepto': ['zepto.min'],
        'underscore': ['underscore-min']
    },
    shim: {
        'underscore': {
            exports: '_',
            deps: ['Zepto']
        }
    }
});

require(["Zepto", 'underscore'], (Zepto, _) => {

    const apps_2_exclude = [
        "Downloads", "EmergencyCall", "System", "Legacy", "Ringtones",
        "Legacy Home Screen", "Wallpaper", "Default Theme", "Purchased Media",
        "Built-in Keyboard", "Bluetooth Manager", "Communications",
        "PDF Viewer", "Network Alerts", "WAP Push manager", "Default Home Screen" ];

    // basic vars
    var parent = $('#apps');
    var settings = $('#menu_settings');
    var iconMap = new WeakMap();

    /* CONFIG */

    var bg = true;
    var x = 2; //default icon columns key value
    var config = {};

    config.empty_letters = true;
    config.columns = [];
    config.columns[2] = 65;
    config.columns[3] = 35;
    // color tiles
    config.color_tile = null;
    config.pink_tile_bg  = "#f8b3f8";
    config.green_tile_bg = "#55AA55";
    config.big_tile_width = "108px";
    config.small_tile_width = "75px";
    // theme colors
    config.color_theme = [];
    config.color_theme['violet']= "-moz-linear-gradient(-45deg, violet, navy);";
    config.color_theme['green'] = "-moz-linear-gradient(-45deg, green, #116611);";
    config.selected_theme = 'violet';




    /* END CONFIG */

    var app_status = (state_apps, state_settings) => {
        parent.css('display', state_apps);
        settings.css('display', state_settings);
    }


    /**
     * Letters section generator
     */
    var print_letter = l => {
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
     * Prints set up message
     */
     var print_msg = () => {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
        parent.html(txt_msg);
     };

    /**
     * Renders the icon to the container.
     */
    var render = icon => {

        if (!icon.manifest.icons) return;

            // guards
            if( _.contains ( apps_2_exclude, icon.manifest.name ))  return;
            if (icon.manifest.role == "homescreen")                 return;
            if (icon.manifest.role == "addon")                      return;
            //end guards

            var icon_image = navigator.mozApps.mgmt.getIcon(icon, 80);


            icon_image.then ( img => {

                var name = icon.manifest.name;console.log(name);
                var wordname = name.split(" ");
                var firstchar = name.charAt(0);
                var tile_bg = ('violet' == config.selected_theme)? config.pink_tile_bg : config.green_tile_bg;

                /* tile generation*/
                var tile = document.createElement('div');
                tile.className = 'tile';
                tile.className += ' icon_' + wordname[0];
                var str_tile = (config.color_tile)? ", "+ tile_bg : "";
                tile.style.background = 'url(' + window.URL.createObjectURL( img )+ ') center/' + config.columns[x] + '% no-repeat' + str_tile;
                tile.style.background = tile.style.background.replace(/&quot;/g,'"');
                tile.style.width = (2 == x) ? config.big_tile_width : config.small_tile_width;
                if (3 == x) tile.style.height = config.small_tile_width;

                if (_.isEmpty($('.'+ 'icon_' + wordname[0])))  $('#' + firstchar).append(tile);
                if (config.empty_letters) {
                    $('#' + firstchar).show(); //FIXME zepto show() is very slow :(
                }
                iconMap.set(tile, icon);
                /* end tile generation*/
            });

            if (typeof icon_image == undefined) return;

    }

    /* fires up the painting */
    var start = () => {
            background = config.color_theme[config.selected_theme];


            //clean up to redraw
            $('.tile').remove();
            $('.letter').remove();
            // end clean up

            // draw section letters
            for (z = 65; z < 91; z++) { // old reliable «for» loop :)
                print_letter( String.fromCharCode(z) );
            }

            /**
             * Fetch all apps and render them.
             */
            var myApps = new Promise((resolve, reject) => {
                    var request = navigator.mozApps.mgmt.getAll();

                    request.onsuccess = (e) => {
                      for (var app of request.result) {
                        render( app );
                      }
                    };

                    request.onerror = (e) => {
                      console.error('Error calling getAll: ' + request.error.name);
                      resolve();
                    };
            });

            myApps.then( v => {

                }, v => {
                    print_msg();
                }
            );


            //options buttons
            if (bg == true) {
                document.getElementById('btn_config__bg_transparent').disabled = false;
                document.getElementById('btn_config__bg_colored').disabled = true;
            }
            if (bg == false) {
                document.getElementById('btn_config__bg_transparent').disabled = true;
                document.getElementById('btn_config__bg_colored').disabled = false;
            }

            //theme
            if (config.selected_theme == "green") {
                document.getElementById('btn_config__green_theme').disabled = true;
                document.getElementById('btn_config__violet_theme').disabled = false;
            }
            if (config.selected_theme == "violet") {
                document.getElementById('btn_config__green_theme').disabled = false;
                document.getElementById('btn_config__violet_theme').disabled = true;
            } //end theme

            if (config.color_tile) {
                document.getElementById('btn_config__tile_transparent').disabled = false;
                document.getElementById('btn_config__tile_colored').disabled = true;
            }
            if (!config.color_tile) {
                document.getElementById('btn_config__tile_transparent').disabled = true;
                document.getElementById('btn_config__tile_colored').disabled = false;
            }

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
            /*
            console.log(e);
            console.log(e.explicitOriginalTarget.data);
            */


            //TO-DO: a switch here, plz

            //cancel
            if (e.target.id == "btn_config__cancel") {
                app_status("block", "none");
            }

            //theme
            if (e.target.id == "btn_config__green_theme") {
                config.selected_theme = "green";
                parent.css('background', config.color_theme[config.selected_theme]);
                start();
            }

            if (e.target.id == "btn_config__violet_theme") {
                config.selected_theme = "violet";
                parent.css('background', config.color_theme[config.selected_theme]);
                start();
            }

            // background
            if (e.target.id == "btn_config__bg_transparent") {
                parent.css('background', 'none');
                bg = false;
                start();
            }

            if (e.target.id == "btn_config__bg_colored") {
                parent.css('background', config.color_theme[config.selected_theme]);
                bg = true;
                start();
            }// end background

            //tiles
            if (e.target.id == "btn_config__tile_transparent") {
                config.color_tile = null;
                start();
            }

            if (e.target.id == "btn_config__tile_colored") {
                config.color_tile = "#f8b3f8";
                start();
            }

            //letters
            if (e.target.id == "btn_config__hide_empty_letters") {
                config.empty_letters = true;
                start();
            }

            if (e.target.id == "btn_config__show_empty_letters") {
                config.empty_letters = false;
                start();
            }

            //columns
            if (e.target.id == "btn_config__icons_2_columns") {
                x = 2;
                start();
            }

            if (e.target.id == "btn_config__icons_3_columns") {
                x = 3;
                start();
            }

        }
    }); //end window event 'click'


    //settings longpress event
    window.addEventListener('contextmenu', () => {

        // hide/show disabled buttons in settings
        _.map($('button'), b => {
            if (b.disabled)
                b.style.display="none";
            else
                b.style.display="block";
        });

        app_status("none", "block");
    }, true);
    //end settings event 'longpress'


    window.addEventListener ("scroll", () => {

        if ((window.innerHeight + window.scrollY) < document.body.scrollHeight) { //avoid infinite scroll

            var adjust_scroll = () => {
                $('#scrollbar').css('marginTop',  $(window).scrollTop());
            }

            setTimeout(adjust_scroll, 1000);
        }
    });

    // 3, 2, 1 ...
    start();

});
