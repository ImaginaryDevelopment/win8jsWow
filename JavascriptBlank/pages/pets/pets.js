var model = function () {
    var self = this;
    self.realms = ko.observableArray();
    self.realm = ko.observable();
    self.error = ko.observable();
    var getRealms = function () {

        WinJS.xhr({ url: "http://us.battle.net/api/wow/realm/status?locale=en_US", responseType: "json" }).then(
        function (response) {
            var json = JSON.parse(response.responseText);
            self.realms.removeAll();
            self.realms.push.apply(self.realms, json.realms);
            var lastRealm = ko.utils.arrayFirst(self.realms(), function (item) {
                return item.name == "Rexxar";
            });
            if (lastRealm)
                self.realm( lastRealm);
            //console.log(JSON.stringify(json.realms[0]));
        },
         function (error) { WinJS.log(error); },
         function (progress) { }
    );
    };
    //Get All Realms
    getRealms();
    self.characterName = ko.observable('Maslow');
    self.character = ko.observable();
    self.thumbnail = ko.computed(function () {
        var charInfo=self.character();
        //http:// <region> + .battle.net/static-render/ + <region> + / + <the string you got from API as thumbnail>
        //http://us.battle.net/static-render/us/rexxar/188/39460796-avatar.jpg?alt=/wow/static/images/2d/avatar/5-0.jpg
        if (charInfo)
            return 'http://us.battle.net/static-render/us/' + charInfo.thumbnail+'?alt=/wow/static/images/2d/avatar/5-0.jpg';
        return '#';
    });
    //http://media.blizzard.com/wow/renders/npcs/pet/creature61160.jpg
    self.pets = ko.observableArray();
    self.numNotCollected = ko.observable();
    self.page = ko.observable(0);
    self.pagesize = ko.observable(5);
    self.sortables = ko.observableArray(['name', 'qualityId', 'creatureName', 'level']);
    self.sortProperty = ko.observable('name');
    self.petssorted = ko.computed(function () {
        var base = self.pets().slice();
        if (!self.pets() || self.pets().length < 1)
            return [];
        var sorted=base.sort(function (a, b) {
            var sortp=self.sortProperty();
            return a[sortp].localeCompare(b[sortp]);
        });
        return sorted;
    });
    self.petsdisplayed = ko.computed(function () {
        var start = self.page() * self.pagesize();
        var end = start + self.pagesize();
        return self.petssorted().slice(start, end);
    });
    self.pages = ko.computed(function () {
        var decimal = self.pets().length / self.pagesize();
        var number = parseInt(Math.ceil(decimal));
        return number;
    });
    self.firstPage = function () {
        self.page(0);
    };
    self.prevPage = function () {
        if (self.page() > 0) {
            self.page(self.page() - 1);
        }
    };
    self.canNext = ko.computed(function () {
        return (self.page() + 1 < self.pages());
    });
    self.nextPage = function () {
        if (self.canNext())
        self.page(self.page() + 1);
    };
    self.isLast = ko.computed(function () {
        return self.page() == self.pages() - 1;
    });
    self.lastPage = function () {
        self.page(self.pages() - 1);
    };
    self.fetchPets = function () {
        self.error('');
        var uri = "http://us.battle.net/api/wow/character/" + self.realm().name + "/" + self.characterName() + "?fields=pets";
        WinJS.xhr({ url: uri, responseType: "json" }).then(
       function (response) {
           var json = JSON.parse(response.responseText);
           self.character(json);
           self.characterName(json.name);
           self.pets.removeAll();
           
           console.log(JSON.stringify(json.pets.collected[0]));
           self.pets.push.apply(self.pets, json.pets.collected);
           self.numNotCollected(json.pets.numNotCollected);
           delete json.pets.collected;
           console.log(JSON.stringify(json));

       },
        function (error) {
            console.log(error); if (error.status === 404) {
                self.error('Realm/Character combo not found');
            }
        },
        function (progress) { }
   );
    };

};
var komodel = new model();
(function () {
    "use strict";

    var app = WinJS.Application;

    WinJS.UI.Pages.define("/pages/pets/pets.html", {

        ready: function (element, options) {
            console.log('ready!');
            

            WinJS.UI.processAll();

            console.log('binding');
            ko.applyBindings(komodel);
            console.log('bound?');
            

            //Get Realm
            //wowapi.getRealmStatus('terenas',app.sessionState.locale).then(function (realms) {

            //    var realmsList = new WinJS.Binding.List(realms);
            //    var lv = document.querySelector("#servers").winControl;
            //    lv.itemDataSource = realmsList.dataSource;
            //    lv.itemTemplate = document.querySelector("#servertemplate");
            //    WinJS.UI.processAll();
            //});

            //Set share contract info you want here.  Can be specific realms, etc.
            app.sessionState.shareTitle = "Pets";

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