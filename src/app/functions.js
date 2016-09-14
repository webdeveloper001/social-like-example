var openModal = function (modalSelector, options) {
    $(modalSelector).modal({
        'backdrop': options && (options.backdrop == true || options.backdrop == false ) ? options.backdrop : "static",
        "keyboard": options && options.keyboard ? options.keyboard : "false",
        "show": "true"
    });
};

var closeModal = function (modalSelector, callback) {
    $(modalSelector).modal('hide');
    if (callback) {
        callback();
    }
};

function calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);    
}