
var sendgrid = require("sendgrid")(process.env.SENDGRID_API_KEY);
const sghelper = require('sendgrid').mail;

var helpers = require('../helpers');
function format(ranking){
    var html = 
    `<tr>
        <td>
            <img  style="max-width:100px" src="` +   (ranking.fimage ? ranking.fimage : ( ranking.image1url ?  ranking.image1url : $rootScope.EMPTY_IMAGE)) +`" />
        </td>
        <td style="padding-left: 10px">`+ (ranking.title) +`</td>
    </tr>`
    return html;
}

function sendWeeklyNewsJob(){
    var newRankings = [];
    var popularRankings = [];
    helpers.getNewRankingThisWeek().end(function(response){
        if (response.body.error)
            return
        newRankings = response.body.resource;
        helpers.getPopularRankingThisWeek().end(function(popularResp){
            if(popularResp.body.error)
                return
            popularRankings = popularResp.body.resource;
            helpers.getSubscribers().end(function(subscriberResp){
                var subscribers = subscriberResp.body.resource;

                subscribers.forEach(function(subscriber){
                    var from_email = new sghelper.Email(process.env.ADMIN_EMAIL);
                    var to_email = new sghelper.Email(subscriber.email);
                    var subject = 'Rank-X';
                    var newRankingsHtml = '';
                    newRankings.forEach(function(ranking){
                        newRankingsHtml += format(ranking);
                    });
                    var popularRankingsHtml = '';
                    popularRankings.forEach(function(ranking){
                        popularRankingsHtml += format(ranking);
                    });
                    var contentHtml = `<div style="background-color:#f0f0f0; padding:20px">
                    <center style="width:100%">
                        <div style="height:100px; line-height:100px">
                            <img src="https://Rank-X.com/assets/images/rankxlogo_noheadline.png" style="max-height:100px"/>
                        </div>
                    </center>`;
                    if(subscriber.subgroup == 2) {
                        subject = 'Promoters weekly mail';
                        contentHtml += `
                        <h2> Hi ` + subscriber.username.split(' ')[0] + `</h2>

                        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
                        
                            <p>Just touching base! Remember you can monitor your accounts by logging to Rank-X and using the Promoter Console. In there you can find the all businesses that have signed up using your account, the status of any subscription, the amount of commission you are earning as well as to when to expect a payment. 
                            </p>
                            <p>Also remember that by logging in to Rank-X, adding rankings and monitoring that businesses information up to date, you help us make Rank-X a more efficient useful app, which in turn will make it easier to sign more businesses which in turn creates more residual income for you, the promoter. 
                            </p>
                            Below you will find more suggestions that make Rank-X a better app.
                            <hr>
                            <ul>
                                <li style="padding-bottom: 5px;">
                                    Anything not working perfect? Let us know, we will do our best to fix it right away!
                                </li >
                                <li style="padding-bottom: 5px;">
                                    Do you know of a new establishment?, check Rank-X to see if they are in the system, if they are not listed, add them!
                                </li>
                                <li style="padding-bottom: 5px;">
                                    Can you think of any useful ranks that would be good to have, create them!
                                </li>
                                <li style="padding-bottom: 5px;">
                                    Did you try looking for something and couldn’t find it? Let’s fix that! Add the ranking and provide answers!
                                </li>
                                <li style="padding-bottom: 5px;">
                                    Encourage friends, family and coworkers to check out Rank-X and to use it to find whatever they are looking for.
                                </li>
                                <li style="padding-bottom: 5px;">
                                    Do you know of an event taking place in San Diego County? If its not listed in Rank-X, list it!
                                </li>
                                <li style="padding-bottom: 5px;">
                                    Looking for new places to eat or you need a service? Look in Rank-X first, endorse and use our premium businesses! Their success is our success!
                                </li>
                                
                            </ul>
                        </div>
                        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
                        
                            Please check the following newest rankings and take some time to see if rankings are accurate. If you have suggestions on better answers please add them:
                            <hr>`;
                        contentHtml += '<table>';
                        contentHtml += newRankingsHtml;
                        contentHtml += '</table>';
                        contentHtml += `
                        </div>
                        <p style="font-size: 17px;">`;

                        contentHtml += `
                                Again, thanks for being a Rank-X promoter. Like always, we are available and happy to answer any questions you may have about your accounts or the Promoter Console. We also invite your suggestions and recommendations!<br/>
                                Best regards,
                            </p>
                            <hr>
                            <center> <p style="font-size: 17px">Rank-X team</p> </center>
                            </div>`;
                    } else if(subscriber.subgroup == 1) {
                        subject = 'Rank-X weekly mail';
                        contentHtml += `<h2> Hi ` + (subscriber.username != '' ? subscriber.username.split(' ')[0] : 'there') + `</h2>`;
                        contentHtml += `<div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
                        
                            Check out the newest rankings that listed below. Take some time to see if rankings are accurate. If you have suggestions on better answers please add them by clicking the link:
                            <hr>`;
                        contentHtml += '<table>';
                        contentHtml += newRankingsHtml;
                        contentHtml += `
                                <tr>
                                    <td colspan=2>
                                        <a style="line-height: 50px" href="https://Rank-X.com/trends">See More New Rankings</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan=2>
                                        <hr>
                                    </td>
                                </tr>`;
                        contentHtml += popularRankingsHtml;
                        contentHtml += `
                                <tr>
                                    <td colspan=2>
                                        <a style="line-height: 50px" href="https://Rank-X.com/trends">See More Popular Rankings</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan=2>
                                        <hr>
                                    </td>
                                </tr>`;
                        contentHtml += '</table>';
                        contentHtml += `
                        </div>
                        <p style="font-size: 17px;">`;

                        contentHtml += `
                                Best regards,
                            </p>
                            <hr>
                            <center> <p style="font-size: 17px">Rank-X team</p> </center>
                            </div>`;
                        
                    }



                    var content = new sghelper.Content('text/html', contentHtml);

                    var mail = new sghelper.Mail(from_email, subject, to_email, content);

                    var request = sendgrid.emptyRequest({
                        method: 'POST',
                        path: '/v3/mail/send',
                        body: mail.toJSON(),
                    });

                    sendgrid.API(request, function(error, response) {
                        if(error)
                            console.log('ERROR', err);
                        else
                            console.log('Sent');
                    });
                });
            });
        });
    });
}

function sendDailyBizMail(){
    helpers.getSubscribedBizList().end(function(response){
        var businesses = response.body.resource;
        // response.body.resource.length;
        helpers.getBizFeedToday()
        .end(sendMailToBiz);
        function sendMailToBiz(response) {
            if (response.body.error)
                return;

            businesses.forEach(function(business){
                if(!business.answer)
                    return
                var feeds = response.body.resource.filter(function(feed){ return feed.answer == business.answer });
                if (feeds.length == 0)
                    return;
                
                var upVoteds = feeds.filter(function(feed){ return feed.action == 'upVoted'});
                var upVotedVrows = feeds.filter(function(feed){ return feed.action == 'upVotedVrow'});
                var commentAs = feeds.filter(function(feed){ return feed.action == 'commentA'});

                if ( upVoteds.length == 0 && upVoteds.length == 0 && commentAs.length == 0 )
                    return
                var from_email = new sghelper.Email(process.env.ADMIN_EMAIL);
                var to_email = new sghelper.Email(business.email);
                var subject = 'Rank-X';
                var contentHtml = `<div style="background-color:#f0f0f0; padding:20px">
                <center style="width:100%">
                    <div style="height:100px; line-height:100px">
                        <img src="https://Rank-X.com/assets/images/rankxlogo_noheadline.png" style="max-height:100px"/>
                    </div>
                </center>`;

                subject = 'Notification of users activities';
                contentHtml += `
                <h2> Hi ` + business.username.split(' ')[0] + `</h2>
                <p style="font-size: 17px;"> 
                We just wanted to notify you of recent user activity on your profile in the last 24 hrs. </p>
        
                    <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
                    <ul style="list-style-type: none;">`;
                for (i = 0; i < upVoteds.length; i++) {
                    contentHtml += `<li style="padding-bottom: 5px"> <b>` + (upVoteds[i].actorusername ? upVoteds[i].actorusername : '') + `</b> endorsed your <b>` + upVoteds[i].text1 + `</b> about <b>` + upVoteds[i].text2 + `</b>.</li>`;
                    if ( i == upVoteds.length - 1 ){
                        contentHtml += '<hr>';
                    }
                }
                if (upVotedVrows.length != 0){
                    for (i = 0; i < upVotedVrows.length; i++) { 
                        contentHtml += `<li style="padding-bottom: 5px"> <b>` + (upVoteds[i].actorusername ? upVoteds[i].actorusername : '') + `</b> endorsed your <b>` + upVotedVrows[i].text1 + `</b> about <b>`;
                        contentHtml += upVotedVrows[i].text2;
                        contentHtml += `</b>.</li>`;
                    }
                    contentHtml += '<hr>';
                }

                if (commentAs.length != 0){
                    for (i = 0; i < commentAs.length; i++) { 
                        contentHtml += `<li style="padding-bottom: 5px"> <b>` + (commentAs[i].actorusername ? commentAs[i].actorusername : '') + `</b> commented in your <b>` + commentAs[i].text1 + `</b>. <br/><p><blockquote style="font-style: italic">`;

                        contentHtml += commentAs[i].comment;

                        contentHtml += `</p></blockquote></li>`;
                    }
                }

                contentHtml += `</ul>
                </div>
                <p style="font-size: 17px;">
                    To visit your business profile, <a href="https://Rank-X.com/mybusiness">click here</a>. <br/>`;
                
                contentHtml += `
                        Like always, we will be very happy to answer any questions you may have about your listing.<br/>
                        Best regards,
                    </p>
                    <hr>
                    <center> <p style="font-size: 17px">Rank-X team</p> </center>
                    </div>`;
                
                var content = new sghelper.Content('text/html', contentHtml);
                var mail = new sghelper.Mail(from_email, subject, to_email, content);

                var request = sendgrid.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: mail.toJSON(),
                });

                sendgrid.API(request, function(error, response) {
                    if(error)
                        console.log('ERROR', err);
                    else
                        console.log('Sent');
                });

            })
        };

    })
}

function sendReportEmail(type, data){

    var from_email = new sghelper.Email(process.env.ADMIN_EMAIL);
    var to_email = new sghelper.Email('andres@rank-x.com');
    var subject = 'Report from Rank-X';
    var contentHtml = `<div style="background-color:#f0f0f0; padding:20px">
    <center style="width:100%">
        <div style="height:100px; line-height:100px">
            <img src="https://Rank-X.com/assets/images/rankxlogo_noheadline.png" style="max-height:100px"/>
        </div>
    </center>`;
    if ( type == 'bindAccount' ){ 
        subject += '-Profile has been bounded to business account';
        contentHtml += `
        <p style="font-size: 17px;"> 
            <b>`+ data.account.username +`</b> binded his account to <b>`+ data.answer.name +`</b></p>`;
        
    } else if ( type == 'planPurchased' ){

        subject += '-Confirmation of Purchase';
        contentHtml += `
        <p style="font-size: 17px;"> 
            <b>`+ data.userName +`</b> purchased`;
        if (data.getPremiumPlan)
            contentHtml += ` <b> Premium Membership </b>`;
        if (data.getPremiumPlan && data.getCustomRanks)
            contentHtml += ` and`;
        if (data.getCustomRanks)
            contentHtml += ` <b>` + data.ranksQuantity +` Custom Ranks</b>`;
        contentHtml += ` for <b>` + data.bizName + '</b>.</p>';
        
    }
    contentHtml += `</div>`;
    var content = new sghelper.Content('text/html', contentHtml);
    var mail = new sghelper.Mail(from_email, subject, to_email, content);

    var request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sendgrid.API(request, function(error, response) {
        if(error)
            console.log('ERROR', error);
        else
            console.log('Sent');
    });
}


function sendMailTo(toemail, type, data){

    var from_email = new sghelper.Email(process.env.ADMIN_EMAIL);
    var to_email = new sghelper.Email(toemail);
    var subject = 'Rank-X';
    var contentHtml = `<div style="background-color:#f0f0f0; padding:20px">
    <center style="width:100%">
        <div style="height:100px; line-height:100px">
            <img src="https://Rank-X.com/assets/images/rankxlogo_noheadline.png" style="max-height:100px"/>
        </div>
    </center>`;
    if ( type == 'bindAccount' ){ 
        subject = 'Profile has been bounded to business account';
        contentHtml += `
        <h2> Hi ` + data.account.username.split(' ')[0] + `</h2>
        <hr>
        <p style="font-size: 17px;"> Thank you for binding your account to the business profile of <b>`+ data.answer.name +`</b>. With this change, you are the only one that can modify its information. Please ensure the contact information is accurate as well as the working hours. </p>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
        
            To get the most out of your Rank-X listing, we encourage you to do the following:
            <hr>
            <ul>
                <li style="padding-bottom: 5px;">
                    Ensure all contact and business information about <b>`+ data.answer.name +`</b> is correct.
                </li >
                <li style="padding-bottom: 5px;">
                    Add <b>`+ data.answer.name +`</b> to all rankings that are applicable. Think about what services you are offering and who could be looking for you and what are you great at.
                </li>
                <li style="padding-bottom: 5px;">
                    Upload a great profile image of your business. We recommend photos of the outside of your business. 
                </li>
                <li style="padding-bottom: 5px;">
                    Upload images that show different aspects of your business. If you have an Instagram account, you can easily import images to be shown in your Rank-X account.
                </li>
                <li style="padding-bottom: 5px;">
                    Encourage your visitors to endorse you on Rank-X. Rankings are based on number of endorsements. The more endorsements in each ranking the higher you will rank.
                </li>
            </ul>
            </div>
            <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
        
            You can enhance even further your business profile by.
            <hr>
            <ul>
                <li style="padding-bottom: 5px;">
                    Purchasing Premium Membership. Premium Membership, allows you to write up to 7 specials in your business profile, which are shown in the ranking list. This makes you more noticeable and will drive more people to your business profile. For more information about Premium Membership, <a href="https://Rank-X.com/mybusiness">click here</a>.
                </li>
                <li style="padding-bottom: 5px;">
                    Purchase Custom Ranks. Custom ranks are a list or ranking of your own products and services, and it’s a great way to engage users and put the spotlight to each one of your products and services. For more information about Custom Ranks, <a href="https://Rank-X.com/mybusiness">click here</a>.
                </li>
            </ul>
        </div>
        <p style="font-size: 17px;">
            To visit your business profile, <a href="https://Rank-X.com/answerDetail/` + data.answer.slug + `">click here</a>. <br/>`;
    } else if ( type == 'planPurchased' ){

        subject = 'Confirmation of Purchase';
        contentHtml += `
        <h2> Hi ` + data.userName.split(' ')[0] + 
        `</h2>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
            <p style="font-size: 17px;"> 
            Thank you for purchasing <b>Premium Membership</b> and <b>Custom Ranks</b> for the business profile of <b>`+data.bizName+`</b>. We appreciate your business and we hope that the listing in Rank-X will drive many customers to you. To get the most out of your subscriptions, please click below for applicable links:</p>
            <hr>
            <p style="font-size: 17px;">
            For Premium Membership tips and suggestions, <a href="https://Rank-X.com/mybusiness">click here</a>.
            </p>
            <p style="font-size: 17px;">
            For Custom Ranks tips and suggestions, <a href="https://Rank-X.com/mybusiness">click here</a>.
            </p>
            <p style="font-size: 17px;">
            To visit your business profile, <a href="https://Rank-X.com/mybusiness">click here</a>.
            </p>
        </div>
        <p style="font-size: 17px;">`;
    } else if ( type == 'promoterCreated' ){

        subject = 'You successfully signed up to be a Rank-X Promoter';
        contentHtml += `
        <h2> Hi ` + data.firstname + 
        `</h2>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
            <p style="font-size: 17px;"> 
            Thank you for becoming a Rank-X Promoter. Rank-X Promoters play an huge part on the success of Rank-X in communicating with businesses the functions of the app as well as keeping all the information updated and accurate.
            </p>
            <p style="font-size: 17px;"> 

            </p>
            <p style="font-size: 17px;"> 
            Your individual Rank-X Promoter code is: <b> ` + data.code + `</b>.
            </p>
            <p style="font-size: 17px;"> 
            This code gives 60 days free for businesses to try Rank-X. Distribute this code to businesses in your social media, in person or any other way. The more businesses that sign up using your code, the more commission you will earn.
            </p>
            <p style="font-size: 17px;"> 
            You can check details of your progress at the <a href="https://Rank-X.com/promoterconsole">Promoter Console</a><br/>
            </p>
        </div>
        <p style="font-size: 17px;">`;
    } else if ( type == 'userSubscribed' ){

        subject = 'Welcome to Rank-X.';
        contentHtml += `
        <h2> Hi there!`;
        contentHtml += 
        `</h2>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
            <p style="font-size: 17px;"> 
            Thank you for subscribing to the Rank-X newsletter. <br/>
            </p>
            
            <p style="font-size: 17px;"> 
            It’s great to have you! Every once in a while we will send you updates on new and popular rankings as well as some interesting results and trends of rankings in your city.  
            All rankings in Rank-X are created collectively, which means they are formed by endorsements of people, just like you! 
            </p>
            <p style="font-size: 17px;"> 
            We invite you to participate and help shape the rankings, by endorsing all your favorite businesses and places in our city.
            </p>
        </div>
        <p style="font-size: 17px;">`;

        
    } else if( type == 'codeSignupSubscription' ) {
        subject = 'You got a new account credited to you in Rank-X!';
        contentHtml += `
        <h2> Hi ` + data.promoter.firstname + `</h2>
        <hr>
        <p style="font-size: 17px;"> Congratulations! <b> ` + data.answer.name + `</b> has signed up to <b>Premium Membership/Custom Ranks</b> using your promoter code. 
        <br/>
        From today, <b> ` + data.answer.name + `</b> will have 60 days free to test the functions of Rank-X. <br/>
        If after 60 days they become a paying subscriber you will be paid a monthly commission. 
        <br/>
        For details on how much you will earn from this account go to your Rank-X Promoter Console  <a href="Rank-X.com/promoterconsole">Promoter Console</a> </p>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
        
            To ensure <b> ` + data.answer.name + `</b> and all other accounts stay subscribed, you can help by logging into the app and keeping an eye that the information there is accurate and useful.
            <hr>
            <ul>
                <li style="padding-bottom: 5px;">
                    Check for new establishments, if they are not listed, add them!
                </li >
                <li style="padding-bottom: 5px;">
                    Can you think of any useful ranks that would be good to have, create them!
                </li>
                <li style="padding-bottom: 5px;">
                    Did you try looking for something and couldn’t find it? Let’s fix that! Add such ranking and provide answers!
                </li>
                <li style="padding-bottom: 5px;">
                    Encourage, friends and family to check out Rank-X and to use it to find whatever they are looking for.
                </li>
                <li style="padding-bottom: 5px;">
                    Do you know of an event coming to your town? If its not listed in Rank-X, list it!
                </li>
                <li style="padding-bottom: 5px;">
                    Looking for new places to eat or you need a service? Look in Rank-X first, endorse and use our premium businesses! Their success is our success!
                </li>
            </ul>
            </div>
        </div>
        <p style="font-size: 17px;">`;
    } else if( type == 'codeCancelSubscription' ) {
        subject = 'An account has cancel their subscription';
        contentHtml += `
        <h2> Hi ` + data.promoter.firstname + `</h2>
        <hr>
        <p style="font-size: 17px;"> Bad news. <b> ` + data.answer.name + ` </b> has cancelled their <b>Premium Membership/Custom Ranks</b> using your promoter code. 
        <br/>
        This was probably because they did not see value in being listed with us. Lets continue and improve and make sure no other business opt out.  <br/>
        </p>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
        
            To ensure businesses stay subscribed, we must have a steady flow of traffic to the app, you can help by logging into the app and keeping an eye that the information there is accurate and useful.
            <hr>
            <ul>
                <li style="padding-bottom: 5px;">
                    Check for new establishments, if they are not listed, add them!
                </li >
                <li style="padding-bottom: 5px;">
                    Can you think of any useful ranks that would be good to have, create them!
                </li>
                <li style="padding-bottom: 5px;">
                    Did you try looking for something and couldn’t find it? Let’s fix that! Add such ranking and provide answers!
                </li>
                <li style="padding-bottom: 5px;">
                    Encourage, friends and family to check out Rank-X and to use it to find whatever they are looking for.
                </li>
                <li style="padding-bottom: 5px;">
                    Do you know of an event coming to your town? If its not listed in Rank-X, list it!
                </li>
                <li style="padding-bottom: 5px;">
                    Looking for new places to eat or you need a service? Look in Rank-X first, endorse and use our premium businesses! Their success is our success!
                </li>
            </ul>
            </div>
        </div>
        <p style="font-size: 17px;">`;
    } else if( type == 'paymentProceed' ) {
        subject = 'You have a payment coming up!';
        contentHtml += `
        <h2> Hi ` + data.promoter.firstname + `</h2>
        <hr>
        <p style="font-size: 17px;"> 
        Good news! You have a payment for $` + Number.toFixed(data.amount/100) + `coming your way! This is for the commissions for all the businesses that have signed up using your account.
        </p>
        <p style="font-size: 17px;"> 
        Let’s keep a good thing going! 
        </p>
        <div style="background-color: white; margin: 10px;border:1px solid black; padding:10px; font-size: 17px;">
        
            To ensure businesses stay subscribed, we must have a steady flow of traffic to the app, you can help by logging into the app and keeping an eye that the information there is accurate and useful.
            <hr>
            <ul>
                <li style="padding-bottom: 5px;">
                    Check for new establishments, if they are not listed, add them!
                </li >
                <li style="padding-bottom: 5px;">
                    Can you think of any useful ranks that would be good to have, create them!
                </li>
                <li style="padding-bottom: 5px;">
                    Did you try looking for something and couldn’t find it? Let’s fix that! Add such ranking and provide answers!
                </li>
                <li style="padding-bottom: 5px;">
                    Encourage, friends and family to check out Rank-X and to use it to find whatever they are looking for.
                </li>
                <li style="padding-bottom: 5px;">
                    Do you know of an event coming to your town? If its not listed in Rank-X, list it!
                </li>
                <li style="padding-bottom: 5px;">
                    Looking for new places to eat or you need a service? Look in Rank-X first, endorse and use our premium businesses! Their success is our success!
                </li>
            </ul>
            </div>
        </div>
        <p style="font-size: 17px;">`;
    }

    if ( type != 'promoterCreated' ){
        contentHtml += `
                Like always, we will be very happy to answer any questions you may have about your listing.<br/>
                Best regards,
            </p>
            <hr>
            <center> <p style="font-size: 17px">Rank-X team</p> </center>
            </div>`;
    } else {
        contentHtml += `
                Like always, we will be very happy to answer any questions you may have about being a Rank-X Promoter.<br/>
                Best regards,
            </p>
            <hr>
            <center> <p style="font-size: 17px">Rank-X team</p> </center>
            </div>`;

    }
    
    var content = new sghelper.Content('text/html', contentHtml);
    var mail = new sghelper.Mail(from_email, subject, to_email, content);

    var request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sendgrid.API(request, function(error, response) {
        if(error)
            console.log('ERROR', error);
        else
            console.log('Sent');
    });
}

function userSubscribed(req, res, next) {
    var callbackData = {
        userid: 0,
        email: req.body.email,
        options: 'weeklynews',
        subgroup: 1,
        username: req.body.username ? req.body.username : ''
    }

    helpers.writeToDreamFactoryEmailSubscriptions('addNewSubscriber', 0, callbackData)
    .end(function(resp){
        console.log(resp);
        res.json({response: resp.body});
    })

    sendMailTo(req.body.email, 'userSubscribed', req.body);
}

function promoterCreated(req, res, next) {
    var callbackData = {
        userid: req.body.id,
        email: req.body.email,
        options: 'bizsignup:bizcancel:weeklynews',
        subgroup: 3,
        username: req.body.firstname + ' ' + req.body.lastname
    }
    helpers.writeToDreamFactoryEmailSubscriptions('addNewSubscriber', 0, callbackData)
    .end(function(resp){
        console.log(resp);
        res.json({response: resp.body});
    })

    sendMailTo(req.body.email, 'promoterCreated', req.body);
}

function newBizCreated(req, res, next) {
    var callbackData = {
        userid: req.body.account.id,
        email: req.body.account.email,
        answer: req.body.answer.id,
        options: 'bind:endorse:commit',
        username: req.body.account.username,
        subgroup: 2,
    }
    
    helpers.writeToDreamFactoryEmailSubscriptions('addNewSubscriber', 0, callbackData)
    .end(function(resp){
        console.log(resp);
        res.json({response: resp.body});
    })
    sendMailTo(req.body.account.email, 'bindAccount', req.body);
    sendReportEmail('bindAccount', req.body);
}

function newImageUploaded(req, res, next) {
    var callbackData = {
        userid: req.body.user,
        answer: req.body.answer,
        answername: req.body.answername,
        username: req.body.username,
        imageurl: req.body.imageurl,
    }
    
    sendUploadedImageNotification(req.body,'andres@rank-x.com');
    sendUploadedImageNotification(req.body,'amoctezuma81@gmail.com');
}

function sendUploadedImageNotification(x, target_email){
   
    var from_email = new sghelper.Email(process.env.ADMIN_EMAIL);
    var to_email = new sghelper.Email(target_email);
    var subject = 'Report from Rank-X';
    var contentHtml = `<div style="background-color:#f0f0f0; padding:20px">
    <center style="width:100%">
        <div style="height:100px; line-height:100px">
            <img src="https://Rank-X.com/assets/images/rankxlogo_noheadline.png" style="max-height:100px"/>
        </div>
    </center>`;
    
        subject += '- A new image was uploaded';
        contentHtml += `
        <p style="font-size: 17px;"> 
            <b>User: `+ x.username +`</b> uploaded the following image to <b>`+ x.answername +`</b></p>`+
            `<img src="`+ x.imageurl + `" style="width:200px;height:auto"/>`;
    
    contentHtml += `</div>`;
    var content = new sghelper.Content('text/html', contentHtml);
    var mail = new sghelper.Mail(from_email, subject, to_email, content);

    var request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });

    sendgrid.API(request, function(error, response) {
        if(error)
            console.log('ERROR', error);
        else
            console.log('Sent');
    });
}

function codeSignupSubscription(promoCode, accountId){
    var callObj = {};
    helpers.getPromoterByCode(promoCode)
    .end(function (response){
        if ( response.body.error )
            return;
        callObj.promoter = response.body.resource[0];
        helpers.getAccountById(accountId)
        .end(function(account){
            if ( account.body.error )
                return;
            helpers.getAnswerById(account.body.resource[0].answer)
            .end(function(answer){
                if ( answer.body.error )
                    return;
                callObj.answer = answer.body.resource[0];
                sendMailTo(callObj.promoter.email, 'codeSignupSubscription', callObj);
            });
        })
    });
}

function codeCancelSubscription(accountId){
    var callObj = {};

    helpers.getAccountById(accountId)
    .end(function(account){
        if ( account.body.error )
            return;

        helpers.getPromoterByCode(account.body.resource[0].promocode)
        .end(function (promoter){
            if ( promoter.body.error )
                return;
            if ( promoter.body.resource.length == 0 ) 
                return 
            callObj.promoter = promoter.body.resource[0];
            helpers.getAnswerById(account.body.resource[0].answer)
            .end(function(answer){
                if ( answer.body.error )
                    return;
                callObj.answer = answer.body.resource[0];
                sendMailTo(callObj.promoter.email, 'codeCancelSubscription', callObj);
            });
        })
    });
}

function paymentProceed(amount, promoterId){
    var callObj = {};
    helpers.getPromoterById(promoterId)
    .end(function (promoter){
        if ( promoter.body.error )
            return;
        if ( promoter.body.resource.length == 0 ) 
            return 
        callObj.promoter = promoter.body.resource[0];
        callObj.amount = amount;
        sendMailTo(callObj.promoter.email, 'paymentProceed', callObj);
    })
}

module.exports = {
    sendWeeklyNewsJob: sendWeeklyNewsJob,
    sendDailyBizMail: sendDailyBizMail,
    userSubscribed: userSubscribed,
    promoterCreated: promoterCreated,
    newBizCreated: newBizCreated,
    sendMailTo: sendMailTo,
    codeSignupSubscription: codeSignupSubscription,
    codeCancelSubscription: codeCancelSubscription,
    paymentProceed: paymentProceed,
    sendReportEmail: sendReportEmail,
    newImageUploaded: newImageUploaded,
    sendUploadedImageNotification: sendUploadedImageNotification
}