(function () {
    'use strict';

    angular
        .module('app')
        .service('rank', rank);

    rank.$inject = ['$rootScope'];

    function rank($rootScope) {

        //Members
        $rootScope.A = [];
        var R = [];
        var GP = [];
        var A = [];
        
        var answersR = [];

        var service = {

            computeRanking: computeRanking
        };

        return service;

        function computeRanking(answers, mrecs) {

            var N = answers.length;
            var M = N*(N-1)/2;
            var L = mrecs.length;
            var ansHS = 0;
            var ansLS = 0;
            var GPtemp = 0;
            var mGP = 0; //mean of games played
                        
            //initialize 2d array
            for (var i = 0; i < N; i++) {
                R[i] = new Array(N); //Results Array
                GP[i] = new Array(N); //Games Played Array
                for (var j = 0; j < N; j++) {
                    R[i][j] = 0;
                    GP[i][j] = 0;
                }
                A[i] = answers[i].id;                
            }

            for (i = 0; i < L; i++) {

                ansHS = A.indexOf(mrecs[i].hs);
                ansLS = A.indexOf(mrecs[i].ls);
                if (ansHS >= 0 && ansLS >= 0) {
                    //console.log("HS, LS", ansHS, ansLS);
                    if (mrecs[i].sel == mrecs[i].hs) {
                        R[ansHS][ansLS]++;
                        //R[ansLS][ansHS]--;
                    }
                    else if (mrecs[i].sel == mrecs[i].ls) {
                        //R[ansHS][ansLS]--;
                        R[ansLS][ansHS]++;
                    }
                    GP[ansHS][ansLS]++;
                    GP[ansLS][ansHS]++;
                }
            }
            
            //Get average games played
            GPtemp = 0;
            for (i = 0; i < N; i++) {
                for (j = 0; j < N; j++) {
                    GPtemp = GPtemp + GP[i][j];
                }
            }
            mGP = GPtemp / (4*M); //get half of the mean of games played between each answer
            //console.log("@rank - mGP: ", mGP); 
   
            //Sum relV points for each answer
            for (i = 0; i < N; i++) {
                answers[i].Rank = 0;
                GPtemp = 0;
                for (j = 0; j < N; j++) {
                    //cummulative sum of relative vector points
                    answers[i].Rank = answers[i].Rank + R[i][j];
                    //Get total number of games played for this answer
                    GPtemp = GPtemp + GP[i][j];                                         
                }
                
                answers[i].Rank = answers[i].Rank / GPtemp;
                //if this answer has played fewer games than half the mean, multiply by reducing factor
                //TODO. Now using linear reducing factor. Later can revise for a better statistical curve.
                if (GPtemp < mGP) answers[i].Rank = answers[i].Rank * (GPtemp / mGP);
                if (isNaN(answers[i].Rank)) answers[i].Rank = 0;
            }

            //Check one by one, compare rank and relative comparison
            for (var k = 0; k < N; k++) {
                for (j = 0; j < N; j++) {
                    if (k != j) {
                        if ((answers[j].Rank >= answers[k].Rank) && (R[k][j] > R[j][k]) && (GP[k][j] >= mGP)) {
                            answers[k].Rank = answers[j].Rank + 0.01;
                        }
                    }
                }
            }

            answersR = answers;

            $rootScope.answersR = answersR;
            $rootScope.R = R;
            $rootScope.GP = GP;
            $rootScope.A = A;

        }

    }
})();