var model = function () {
    var self = this;
    self.helloknockout = ko.observable('hello');
    self.realms = ko.observableArray();
    self.realm = ko.observable();
    self.error = ko.observable();
    var getRealms = function () {
       
        WinJS.xhr({ url: "http://us.battle.net/api/wow/realm/status?locale=en_US", responseType: "json" }).then(
        function (response) {
            var json = JSON.parse(response.responseText);
            self.realms.removeAll();
            self.realms.push.apply(self.realms, json.realms);
            console.log(JSON.stringify( json.realms[0]));
        },
         function (error) { WinJS.log(error); },
         function (progress) { }
    );
    };
    getRealms();
    self.character = ko.observable('Maslow');
    self.pets = ko.observableArray();
    self.page = ko.observable(0);
    self.pagesize = ko.observable(10);
    self.petsdisplayed = ko.computed(function () {
        var start = self.page() * self.pagesize();
        var end = start + self.pagesize();
        return self.pets().slice(start, end);
    });
    self.firstPage = function () {
        self.page(0);
    };
    self.prevPage = function () {
        if (self.page() > 0) {
            self.page(self.page() - 1);
        }
    };
    self.nextPage = function () {
        self.page(self.page() + 1);
    };
    self.fetchPets = function () {
        self.error('');
        var uri="http://us.battle.net/api/wow/character/"+self.realm().name+"/"+self.character()+"?fields=pets";
        WinJS.xhr({ url: uri, responseType: "json" }).then(
       function (response) {
           var json = JSON.parse(response.responseText);
           self.pets.removeAll();
           console.log(JSON.stringify(json.pets.collected[0]));
           self.pets.push.apply(self.pets, json.pets.collected);
           
       },
        function (error) {
            console.log(error); if (error.status === 404) {
                self.error('Realm/Character combo not found');
            }},
        function (progress) { }
   );
    };
    
};
var komodel = new model();
(function () {
    "use strict";
   
    var app = WinJS.Application;

    WinJS.UI.Pages.define("/pages/kotesting/kotesting.html", {

        ready: function (element, options) {
            console.log('ready!');
            //Get All Realms

            WinJS.UI.processAll();
            console.log('activated');
           // MSApp.execUnsafeLocalFunction(function () {
                console.log('binding');
                ko.applyBindings(komodel);
                console.log('bound?');
           // });

            //Get Realm
            //wowapi.getRealmStatus('terenas',app.sessionState.locale).then(function (realms) {

            //    var realmsList = new WinJS.Binding.List(realms);
            //    var lv = document.querySelector("#servers").winControl;
            //    lv.itemDataSource = realmsList.dataSource;
            //    lv.itemTemplate = document.querySelector("#servertemplate");
            //    WinJS.UI.processAll();
            //});

            //Set share contract info you want here.  Can be specific realms, etc.
            app.sessionState.shareTitle = "ko test ftw!";

        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
 
})();