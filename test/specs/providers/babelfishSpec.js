'use strict';
var urlI18n = "/i18n/languages.json",
    urlI18nFr = "/i18n/fr-FR.json",
    urlI18nEn = "/i18n/en-EN.json",
    $httpBackend,
    scope,
    frAnswer = {
      "_common": {
        "home": "Maison",
        "currency": "€",
        "welcome_cart": "titre"
      },
      "test": {
        "page": "test page"
      },
      "home": {
        "welcome_cart": "Bienvenue sur ngBabelfish",
        "custom": "bonjour"
      }
    },
    enAnswer = {
      "_common": {
        "home": "Home",
        "currency": "$",
        "welcome_cart": "title"
      },
      "test": {
        "page": "test page"
      },
      "home": {
        "welcome_cart": "Welcome to ngBabelfish",
        "custom": "hello"
      }
    },
    answer = {
      "fr-FR": frAnswer,
      "en-EN": enAnswer
    };

describe('Provider@babelfish:  please translate them all', function() {

    var scope, babelfish;

    beforeEach(module('ui.router'));

    beforeEach(module('ngBabelfish', function (babelfishProvider) {
        babelfishProvider.init();
    }));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get("$httpBackend");
        $httpBackend.when("GET", urlI18n)
          .respond(200, answer);

        scope = $injector.get('$rootScope');
        babelfish = $injector.get('babelfish');;
    }));

    beforeEach(function() {
        $httpBackend.expectGET(urlI18n);
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });


    describe('Populate translations', function() {

        it('should be loaded', function () {
            expect(babelfish.isLoaded()).toBe(true);
        });

        it('should have some translations available', function () {
            expect(babelfish.all()).toBeDefined();
        });

        it('should have common translations', function () {
            expect(babelfish.all()['_common']).toBeDefined();
            expect(babelfish.all()['_common'].currency).toBe('$');
        });

        it('should have been Populate the scope', function() {
            expect(scope.currency).toBeDefined();
            expect(scope.currency).toBe('$');
        });

        it('should have en-EN translations', function () {
            expect(babelfish.current()).toBe('en-EN');
            expect(babelfish.get('en-EN')).toBeDefined();
        });

        it('should overide sharred keys with the current keys for a page', function () {
            expect(babelfish.all()['_common'].welcome_cart).toBe('title');
            expect(babelfish.get().welcome_cart).toBe('Welcome to ngBabelfish');
            expect(scope.welcome_cart).toBeDefined('Welcome to ngBabelfish');
        });

        it('should switch to french translations', function () {
            babelfish.updateLang('fr-FR');
            expect(document.documentElement.lang).toBe('fr');
            expect(babelfish.current()).toBe('fr-FR');
        });

        it('should have all translations', function () {
            expect(Object.keys(babelfish.available()).length).toEqual(2);
        });
    });

    describe('When we change a state', function() {

        it('should be defined for an unknown state', inject(function (babelfish) {

            console.warn = function() {};

            babelfish.updateState('test');

            babelfish.updateState('test');
            expect(babelfish.get()).toBeDefined();
            expect(Object.keys(babelfish.get()).length).toBeGreaterThan(0);
        }));

        it('should contains our data for an known state', inject(function (babelfish) {
            babelfish.updateState('home');
            expect(babelfish.get().welcome_cart).toBeDefined('Welcome to ngBabelfish');
            expect(Object.keys(babelfish.get()).length).toBeGreaterThan(0);
        }));

        it('should show a warning for an unknown state one change', inject(function (babelfish) {
            console.warn = function(message,replace1, replace2) {
                expect(replace1).toBe('test');
            };

            babelfish.updateState('test');

        }));
    });



    describe('Are you listening to me ?', function() {

        beforeEach(inject(function ($injector) {
            scope = $injector.get('$rootScope');
            spyOn(scope, '$emit');
            document.documentElement.lang = '';
        }));

        it('should trigger en event when we change the lang', inject(function (babelfish) {

            babelfish.updateLang('fr-FR');
            expect(scope.$emit).toHaveBeenCalledWith('ngBabelfish.translation:changed', {
                previous: 'en-EN',
                value: 'fr-FR'
            });
        }));

        it('should trigger en event when we change the lang and its not defined', inject(function (babelfish) {

            babelfish.updateLang();
            expect(scope.$emit).toHaveBeenCalledWith('ngBabelfish.translation:changed', {
                previous: 'en-EN',
                value: 'en-EN'
            });
        }));


        it('should trigger en event when we load another language', inject(function (babelfish) {

            babelfish.updateState('test');
            expect(scope.$emit).toHaveBeenCalledWith('ngBabelfish.translation:loaded', {
                currentState: 'test',
                lang: 'en-EN'
            });
        }));

    });
});

describe('Provider@babelfish: Loading a wrong file (with debug mode)', function(){

    beforeEach(module('ui.router'));

    beforeEach(module('ngBabelfish', function (babelfishProvider) {
        babelfishProvider.init({
            debug: false
        });
    }));

    beforeEach(inject(function ($injector) {
        spyOn(window,'alert');
        $httpBackend = $injector.get("$httpBackend");
        $httpBackend.when("GET", urlI18n)
          .respond(400, answer);
    }));

    beforeEach(function() {
        $httpBackend.expectGET(urlI18n);
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should pop an alert', function() {
        expect(window.alert).toHaveBeenCalledWith('Cannot load i18n translation file');
    });
});

describe('Provider@babelfish: Loading a wrong file (no debug mode)', function(){

    beforeEach(module('ui.router'));

    beforeEach(module('ngBabelfish', function (babelfishProvider) {
        babelfishProvider.init();
    }));

    beforeEach(inject(function ($injector) {
        spyOn(window,'alert');
        $httpBackend = $injector.get("$httpBackend");
        $httpBackend.when("GET", urlI18n)
          .respond(400, answer);
    }));

    beforeEach(function() {
        $httpBackend.expectGET(urlI18n);
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });
});

describe('Provider@babelfish: Add a namespace', function(){

    var scope;

    beforeEach(module('ui.router'));

    beforeEach(module('ngBabelfish', function (babelfishProvider) {
        babelfishProvider.init({
            namespace: 'i18n'
        });
    }));

    beforeEach(inject(function ($injector) {
        scope = $injector.get('$rootScope');
        $httpBackend = $injector.get("$httpBackend");
        $httpBackend.when("GET", urlI18n)
          .respond(200, answer);

        document.documentElement.lang = '';
    }));

    beforeEach(function() {
        $httpBackend.expectGET(urlI18n);
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should contains translations inside i18n key', inject(function (babelfish) {
        expect(scope.i18n).toBeDefined();
    }));

    it('should have teh content from each page', inject(function (babelfish) {
        expect(scope.i18n.welcome_cart).toBe("Welcome to ngBabelfish");
    }));
});

describe('Provider@babelfish: Lazy mode for translations', function() {

    var babelfish;

    beforeEach(module('ui.router'));

    beforeEach(module('ngBabelfish', function (babelfishProvider) {
        babelfishProvider.init({
            namespace: 'i18n'
        });

        babelfishProvider
            .lang({
                lang: "fr-FR",
                url: urlI18nFr
            })
            .lang({
                lang: "en-EN",
                url: urlI18nEn
            })
    }));

    beforeEach(inject(function ($injector) {
        scope = $injector.get('$rootScope');
        $httpBackend = $injector.get("$httpBackend");
        babelfish = $injector.get('babelfish');
        // $httpBackend.when("GET", urlI18nFr)
        //   .respond(200, frAnswer);

        $httpBackend.when("GET", urlI18nEn)
          .respond(200, enAnswer);

        document.documentElement.lang = '';
    }));

    beforeEach(function() {
        // $httpBackend.expectGET(urlI18nFr);
        $httpBackend.expectGET(urlI18nEn);
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should load the en-EN lang', function () {
        expect(babelfish.available().indexOf('en-EN') > -1).toBe(true);
    });

    it('should only load  the en-EN lang', function () {
        expect(Object.keys(babelfish.translations()).length).toEqual(1);
    });

    it('should load the home translations for en-EN', function () {
        expect(babelfish.current()).toBe('en-EN');
    });

    it('should fill the scope with some translations', function() {
        expect(scope.i18n).toBeDefined();
        expect(scope.i18n.welcome_cart).toBeDefined();
    });

    it('should have home translations for en-EN', function () {
        expect(babelfish.get().welcome_cart).toBeDefined('Welcome to ngBabelfish');
    });

    it('should have all translations', function () {
        expect(Object.keys(babelfish.available()).length).toEqual(2);
    });

    describe('switch to another langage', function() {

        beforeEach(function() {

            inject(function ($injector) {
                $httpBackend = $injector.get("$httpBackend");
                $httpBackend.when("GET", urlI18nFr)
                  .respond(200, frAnswer);
                spyOn(scope,'$emit');
            });

            babelfish.updateLang('fr-FR');
            $httpBackend.expectGET(urlI18nFr);
            $httpBackend.flush();
        });

        it('should switch to french translations', function () {
            expect(document.documentElement.lang).toBe('fr');
            expect(babelfish.current()).toBe('fr-FR');
        });

        it('should update the scope', function() {
            expect(scope.i18n.home).toBe('Maison');
        });

        it('should trigger the changed event', function () {
            expect(scope.$emit).toHaveBeenCalledWith('ngBabelfish.translation:changed', {
                previous: 'en-EN',
                value: 'fr-FR'
            });
        });
    });
});