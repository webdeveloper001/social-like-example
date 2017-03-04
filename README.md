# rank
Refactored code base for rank
# RankX


# LAUNCH 2 SERVERS:
# 1) START YOUR LOCAL NODE SERVER
cd to app base directory
gulp serve
open browser, navigate to: http://localhost:3006/

# 2) START YOUR LOCAL STRIPE SERVER
cd stripeServer
node stripeapi.srvc.js
( the node client browser will make requests to this server on port 3000 )
*   _more readme.md_


# Setup: Stripe Server
cd stripeServer
npm init npm install --save stripe express body-parser node index.js
*   _more readme.md_



# Setup: local dev env setup

    *   github desktop

        *   https://github.com/aikidoesurf81/RankX

        *   cloned to ~/Documents/RankX

    *   atom

    *   code setup

        *   cd <app directory>

        *   nvm use --delete-prefix v4.7.0

        *   sudo npm install

        *   -- SKIPPING sudo npm config set prefix /usr/local

        *   sudo npm install -g bower

        *   mkdir bower_components

        *   sudo npm install -g gulp

        *   _install gulp dependencies_

            *   _from: https://code.tutsplus.com/tutorials/gulp-as-a-development-web-server--cms-20903_

            *   sudo npm install --save-dev gulp gulp-util

            *   sudo npm install --save-dev gulp-uglify gulp-concat

            *   sudo bower --allow-root install

            *   chose Angular v1.6.1 (was: v1.5.7 but caused issues w/ angular libraries needing 1.6.1)

                *   do not persist to json

            *   sudo bower install --save --allow-root angular-ui-router

        *   gulp serve (!! note: if strange errors in browser, make sure you're using the right versions of node and npm)

            *   use node v4.7.0

            *   (do not use v6.9.2)


  *   Deploying to Github

    *   remember that the project runs from the 'dist' folder.

    *   Before pushing the project, you need to build using:
           gulp serve:dist

    *   If you dont, the live project will not see your changes.
