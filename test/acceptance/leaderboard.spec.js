/*global jasmine, require, console, expect, describe, it, beforeEach, afterEach, waitsFor*/

(function () {
    "use strict";

    jasmine.getEnv().defaultTimeoutInterval = 25000;

    // GENERIC MIXIN
    var helper = require('rtd').helper,
        webdriver = require('selenium-webdriver'),
        flow = webdriver.promise.controlFlow(),
        driver,
        resetApp,
        openApp,
        error,
        setupPlayers,
        authenticate,
        findPlayerByName,
        selectPlayer,
        giveThemFivePoints,
        verifyTheirScoreIs,
        verifyTheirScoreIs10,
        verifyTheirScoreIs15;


    resetApp = function () {
        var deferred = webdriver.promise.defer();
        driver.get('http://localhost:8000/reset').then(function () {
            deferred.fulfill();
        });
        return deferred.promise;
    };

    openApp = function () {
        var deferred = webdriver.promise.defer();
        driver.get('http://localhost:8000').then(function () {
            deferred.fulfill();
        });
        return deferred.promise;
    };

    error = function (err) {
        console.log('\n');
        console.error(err);
        console.error('Error in acceptance tests');
    };

    // ****************************************************************************************

    setupPlayers = function () {
        return driver.get('http://localhost:8000/setupPlayers');
    };

    authenticate = function () {
        var email = 'some@one.com',
            password = 'test1234',
            deferred = webdriver.promise.defer();

        driver.findElement(webdriver.By.id('login-sign-in-link')).click();
        driver.findElement(webdriver.By.id('login-email')).sendKeys(email);
        driver.findElement(webdriver.By.id('login-password')).sendKeys(password);
        driver.findElement(webdriver.By.id('signup-link')).click();
        driver.findElement(webdriver.By.id('login-buttons-password')).click();
        driver.findElement(webdriver.By.id('login-name-link')).getText()
            .then(function (value) {
                if (value.indexOf(email) !== 0) {
                    deferred.rejected(value + ' did not contain ' + email);
                } else {
                    deferred.fulfill();
                }
            });
        return deferred.promise;
    };

    findPlayerByName = function (name) {
        return function () {

            var mainDefer = webdriver.promise.defer();

            driver.findElements(webdriver.By.className('player')).then(function (players) {

                var matchDefer = webdriver.promise.defer(),
                    matchPromise = matchDefer.promise,
                    resolved;

                players.map(function (player) {
                    player.findElement(webdriver.By.className('name')).then(function (playerName) {
                        flow.execute(function () {
                            playerName.getText().then(function (value) {
                                if (value === name) {
                                    resolved = true;
                                    matchDefer.fulfill(player);
                                }
                            });
                        });
                    });
                });

                flow.execute(function () {
                    matchPromise.then(function (player) {
                        mainDefer.fulfill(player);
                    });
                    expect(resolved).toBe(true);
                });
            });
            return mainDefer.promise;
        };
    };

    selectPlayer = function (player) {
        return player.click();
    };

    giveThemFivePoints = function (player) {
        var mainDefer = webdriver.promise.defer();
        driver.findElement(webdriver.By.className('inc')).then(function (inc) {
            inc.click();
            mainDefer.fulfill(player);
        });
        return mainDefer.promise;
    };

    verifyTheirScoreIs = function (player, points) {
        var mainDefer = webdriver.promise.defer();
        player.findElement(webdriver.By.className('score')).then(function (playerScore) {
            playerScore.getText().then(function (value) {
                expect(parseInt(value, 10)).toBe(points);
                mainDefer.fulfill(player);
            });
        });
        return mainDefer.promise;
    };

    verifyTheirScoreIs10 = function (player) {
        return verifyTheirScoreIs(player, 10);
    };

    verifyTheirScoreIs15 = function (player) {
        return verifyTheirScoreIs(player, 15);
    };

    beforeEach(function () {
        var ready = false;
        helper.getDriverPromise().then(function (result) {
            driver = result;
            resetApp().
                then(setupPlayers).
                then(openApp).
                then(function () {
                    ready = true;
                });
        });
        waitsFor(function () {
            return ready;
        }, "App didn't reset", 10000);
    });

    afterEach(function () {
        var ready = false;
        helper.postBackCoverage().then(function () {
            ready = true;
        });
        waitsFor(function () {
            return ready;
        }, "Coverage didn't postback", 10000);
    });

    describe("Leaderboard functionality", function () {

        it("increases a players score by 5 when the increment button is clicked", function (done) {
            authenticate().
                then(findPlayerByName('Grace Hopper')).
                then(verifyTheirScoreIs10).
                then(selectPlayer).
                then(giveThemFivePoints).
                then(findPlayerByName('Grace Hopper')).
                then(verifyTheirScoreIs15).
                then(function () {
                    done();
                }, error);
        });


//        it("can have a more test here for this spec...", function (done) {
//            finish(done);
//        });

    });

}());