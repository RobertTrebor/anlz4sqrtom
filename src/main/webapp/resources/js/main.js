//var activeMarker = new google.maps.Marker({
//});

//var nowTemp = new Date();
//var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

jQuery.noConflict();
jQuery(document).ready(function($) {


    function initialize() {
        var mapOptions = {

            zoom: 17,
            center: new google.maps.LatLng(52.52778, 13.384167),
            mapTypeId: google.maps.MapTypeId.HYBRID
        };

        var map = new google.maps.Map(document.getElementById('gmap'), mapOptions);

//        new google.maps.Marker({
//            position: new google.maps.LatLng(52.50018, 13.384167),
//            map: map,
//            title: 'Hello World',
//            animation: google.maps.Animation.DROP
//        });

        //var graves = $('.graves');
        var graves = $('.rows');
        $.each(graves, function(i, elem) {

            var lat = $(this).attr("data-lat");
            var lng = $(this).attr("data-lng");
            var firstname = $(this).attr("data-firstname");
            var lastname = $(this).attr("data-lastname");

            var circle = {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: 'green',
                fillOpacity: .8,
                scale: 4.5,
                strokeColor: 'white',
                strokeWeight: 1
            };
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                icon: circle,
//              shadow: pinShadow,
                title: firstname + " " + lastname,
                href: $(this).attr("href")
            });

            

            google.maps.event.addListener(marker, 'click', function() {

                $("body, html").animate({
                    scrollTop: $('[href="' + marker.href + '"]').offset().top - 140
                }, 600);
                
                $.each($('.rows'), function(i, elem) {
                    $(this).removeClass('rowshover');
                });
                
                $('[href="' + marker.href + '"]').addClass('rowshover');
                activeMarker.setMap(null);
                var lng = $(this).attr("data-lng");
                console.log(lat + ", " + lng);
                var m = new google.maps.Marker({
                    //position: new google.maps.LatLng(lat, lng),
                    position: marker.position,
                    map: map,
                    title: 'Hello World'
                });
                activeMarker = m;
            });
            
            

            //marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        });

        

        $('.rows').hover(function() {

            $(this).addClass('rowshover');
            activeMarker.setMap(null);
            var lat = $(this).attr("data-lat");
            var lng = $(this).attr("data-lng");
            var m = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                title: 'Hello World'
            });
            //new google.maps.Circle();
            activeMarker = m;

//          google.maps.event.addListener(m);
        },
                function() {
                    $(this).removeClass('rowshover');
                });
    }

    google.maps.event.addDomListener(window, 'load', initialize);


//    var datebirth = $('#datebirth').datepicker({
//        onRender: function(date) {
//            return date.valueOf() < now.valueOf() ? 'disabled' : '';
//        }
//    }).on('changeDate', function(ev) {
//        if (ev.date.valueOf() > checkout.date.valueOf()) {
//            var newDate = new Date(ev.date)
//            newDate.setDate(newDate.getDate() + 1);
//            checkout.setValue(newDate);
//        }
//        checkin.hide();
//        $('#dpd2')[0].focus();
//    }).data('datepicker');
    
//    var datedeath = $('#datedeath').datepicker({
//        onRender: function(date) {
//            return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
//        }
//    }).on('changeDate', function(ev) {
//        checkout.hide();
//    }).data('datepicker');

});