function calculate24(str) {
    var h1 = Number(str[1] - '0');
    var h2 = Number(str[0] - '0');
    var hh = (h2 * 10 + h1 % 10);
    var time24 = [];
    // If time is in "AM"
    if (str[8] == 'A') {
        if (hh == 12) {
            time24.push("00");
            for (var i = 2; i <= 7; i++)
                time24.push(str[i]);
        }
        else {
            for (var i = 0; i <= 7; i++)
                time24.push(str[i]);
        }
    }

    // If time is in "PM"
    else {
        if (hh == 12) {
            time24.push("12");
            for (var i = 2; i <= 7; i++)
                time24.push(str[i]);
        }
        else {
            hh = hh + 12;
            time24.push(hh);
            for (var i = 2; i <= 7; i++)
                time24.push(str[i]);
        }
    }
    return (time24.join(""))
}



function onClick2() {
    var time = document.getElementById("time").value
    if (time.length != 10) {
        document.getElementById("error").style.display = "block";
    }
    else {
        document.getElementById("error").style.display = "none";
    }
    time = calculate24(time)
    var reserv = new Date(2020, 11, 11, time.slice(0, 2), time.slice(3, 5), time.slice(6, 8))
    time = new Date(reserv.getTime() + 2745000).toTimeString().slice(0, 8)
    document.getElementById("result").innerHTML = time;
    return false;
}

function countFreq(arr, n) {
    var mp = new Map();

    // Traverse through array elements and
    // count frequencies
    for (var i = 0; i < n; i++) {
        if (mp.has(arr[i]))
            mp.set(arr[i], mp.get(arr[i]) + 1)
        else
            mp.set(arr[i], 1)
    }

    //arranging ascending order
    mp[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    }
    const initialValue = mp.values().next().value
    let finalValue = 0
    for (let [key, value] of mp) {     // get data sorted
        console.log(key + ' ' + value);
        finalValue = value
    }
    return getkeys(mp, finalValue)[0] + " " + getkeys(mp, initialValue)[0];

}
function getkeys(mp, value) {
    let jhonKeys = [...mp.entries()]
        .filter(({ 1: v }) => v === value)
        .map(([k]) => k);
    return jhonKeys;
}

function onClick() {
    var arr = document.getElementById("array").value.split(" ")
    console.log(arr.length)
    if (arr.length === 1) {
        document.getElementById("error").style.display = "block";
    }
    else {
        document.getElementById("error").style.display = "none";
    }
    var n = arr.length;
    document.getElementById("hello").innerHTML = countFreq(arr, n);
    return false;
}