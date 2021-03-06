export function average(arr) {
    return sum(arr) / arr.length;
}

export function alphaSort(a, b) {
    return a.localeCompare(b);
}

export function compareInt(a, b) {
    // sort asc by integer
    return a - b; // sort asc
}
export function compareIntThenLex(a, b) {
    // sort ascending by integer, and then lexically
	// ['1', '10', '2'] ->
	// ['1', '2', '10']

    let inta = parseInt(a, 10);
    let intb = parseInt(b, 10);
    let isaint = !isNaN(inta);
    let isbint = !isNaN(intb);
    if (isaint && isbint) {
        return inta - intb; // sort asc
    } else if (isaint && !isbint) {
        return -1; // sort a to lower index then b
    } else if (!isaint && isbint) {
        return 1; // sort b to lower index then a
    } else {
        // neither are int's
        return a.localeCompare(b)
    }
}

export function calcSalt({
        sensitive=false, // case sensitive
        len=8 // length of salt
    }={}) {
	// salt generator from http://mxr.mozilla.org/mozilla-aurora/source/toolkit/profile/content/createProfileWizard.js?raw=1*/

	let mozKSaltTable = sensitive ? [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
		'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
		'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
	] : [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
		'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
	];

	let kSaltString = '';
	for (let i = 0; i < len; ++i) {
		kSaltString += mozKSaltTable[Math.floor(Math.random() * mozKSaltTable.length)];
	}
	return kSaltString;
	// return kSaltString + '.' + aName;
}

export function deepAccessUsingString(obj, dotpath, defaultval){
    // defaultval is returned when it is not found, by default, defaultval is undefined, set it to "THROW" if you want it to throw

    // super simple version:
    // const deepAccessUsingString = (obj, dotpath) => dotpath.split('.').reduce((nested, key) => nested[key], obj);

    let keys = dotpath.split('.');
    let nested = obj;
    for (let key of keys) {
        if (nested && key in nested) nested = nested[key]; // `key in nested` this is point of concern. as `in` works with Array,Set,Map (and i dont know maybe more type) too. i am assuming that nested is always an object
        else
            if (defaultval === 'THROW') throw new Error('deepAccessUsingString: missing "' + dotpath + '"');
            else return defaultval;
    }

    return nested;
}

export function dedupeCaseInsensitive(arr) {
  // removes duplicates in array. case insensitively.
  // based on "Hashtables to the rescue" - http://stackoverflow.com/a/9229821/1828637
  let ixlast = arr.length - 1;
  return arr.reduce(
    (acc, el, ix) => {
      let el_low = el.toLowerCase();
      let { seen, filtered } = acc;
      if (!seen.hasOwnProperty(el_low)) {
        seen[el_low] = true;
        filtered.push(el);
      }
      return ix === ixlast ? filtered : acc;
    },
    { seen:{}, filtered:[] }
  );
}

export function deepSetUsingString(obj, dotpath, newval) {
    // throws if set fails
    // may want to update to - http://stackoverflow.com/a/13719799/1828637

    var stack = dotpath.split('.');

    let nesteddotpath = [];
    while(stack.length > 1){
        let dot = stack.shift();
        nesteddotpath.push(dot);
        obj = obj[dot];
        if (!isObject(obj)) throw new Error(`Found non object at dot path level of "${nesteddotpath.join('.')}". Instead of object, it is "${obj.toString()}". Was trying to set full dotpath of "${dotpath}".`);
    }

    obj[stack.shift()] = newval;

    // let keys = dotpath.split('.');
    // let nested = obj;
    // let nesteddotpath = [];
    // for (let key of keys) {
    //     if (!isObject(nested)) throw new Error(`Found non object at dot path level of "${nesteddotpath.join('.')}". Instead of object, it is "${nested.toString()}". Was trying to set full dotpath of "${dotpath}".`);

    //     nesteddotpath.push(key);
    //     nested = nested[key];
    // }
    // nested = newval;
}

export function escapeRegex(text) {
    let specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
    let sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	return text.replace(sRE, '\\$1');
	// if (!arguments.callee.sRE) {
	// 	var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
	// 	arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	// }
	// return text.replace(arguments.callee.sRE, '\\$1');
}

/**
 * Selects the closest matching locale from a list of locales.
 *
 * @param  aLocales
 *         An array of available locales
 * @param  aMatchLocales
 *         An array of prefered locales, ordered by priority. Most wanted first.
 *         Locales have to be in lowercase.
 * @return the best match for the currently selected locale
 *
 * Stolen from http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/extensions/internal/XPIProvider.jsm
 */
export function findClosestLocale(aLocales, aMatchLocales) {

  // Holds the best matching localized resource
  let bestmatch = null;
  // The number of locale parts it matched with
  let bestmatchcount = 0;
  // The number of locale parts in the match
  let bestpartcount = 0;

  for (let locale of aMatchLocales) {
    let lparts = locale.split(/[-_]/);
    for (let localized of aLocales) {
      let found = localized.toLowerCase();
      // Exact match is returned immediately
      if (locale === found)
        return localized;

      let fparts = found.split(/[-_]/);
      /* If we have found a possible match and this one isn't any longer
         then we dont need to check further. */
      if (bestmatch && fparts.length < bestmatchcount)
        continue;

      // Count the number of parts that match
      let maxmatchcount = Math.min(fparts.length, lparts.length);
      let matchcount = 0;
      while (matchcount < maxmatchcount &&
             fparts[matchcount] === lparts[matchcount])
        matchcount++;

      /* If we matched more than the last best match or matched the same and
         this locale is less specific than the last best match. */
      if (matchcount > bestmatchcount ||
         matchcount === bestmatchcount && fparts.length < bestpartcount) {
        bestmatch = localized;
        bestmatchcount = matchcount;
        bestpartcount = fparts.length;
      }
    }
    // If we found a valid match for this locale return it
    if (bestmatch)
      return bestmatch;
  }
  return null;
}

export function isObject(avar) {
    // cosntructor.name tested for `function Animal(){}; var a = new Animal(); isObject(a);` will return true otherwise as it is [Object object]
    return Object.prototype.toString.call(avar) === '[object Object]' && avar.constructor.name === 'Object';
}

export function isObjectEmpty(obj) {
    // https://stackoverflow.com/a/32108184/1828637
    for(const prop in obj) {
        if(obj.hasOwnProperty(prop)) return false;
    }

    return true;
}

export function mapTruthy(target, mapper) {
    // target is array
    // mapper gets same args Array.prototype.map gets, currentValue, index, array
    // if element in array is undefined/null/false/0, it is skipped
    return target.reduce((acc, el, ix) => {
        if (el) acc.push(mapper(el, ix, acc))
        return acc;
    }, []);
}

export async function retry(callback, {cnt, sec, interval=1000}={}) {
    if (cnt === undefined && sec === undefined) cnt = 10;

    // either supply cnt or sec
        // set sec or cnt to 0 if you want to try endlessly
    // if neither supplied default is 10 retries
    // interval is ms, defauls to 1000

	// callback should return promise
        // throw new Error('STOP' + message) in order to stop retrying and throw the `message`
        // throw new Error() to just say it failed, it will keep retrying
    // callback gets one arg, which is try number, base 0

    // promise resolved or rejected with new Error(FAILED_KEYWORD)

    // set cnt
    if (cnt === 0 || sec === 0) cnt = Infinity;
    else if (sec) cnt = Math.max(Math.floor(sec * 1000 / interval), 1);

    const STOP_KEYWORD = 'STOP';
    const FAILED_KEYWORD = 'FAIL';

    let retries = 0;
    while (retries < cnt) {
        try {
            return await callback(retries);
        } catch(err) {
             // STOP_RETRIES short for STOP_RETRIES_AND_THROW
            if (err.message.startsWith(STOP_KEYWORD)) throw new Error(err.message.substr(STOP_KEYWORD.length));
            else if (++retries < cnt) {
                console.log(err.message)
                await wait(interval);
            }
            else throw new Error(FAILED_KEYWORD);
        }
    }
}

export function sum(arr) {
    return arr.reduce((sum, x) => sum + x);
}

// https://github.com/github/fetch/issues/175#issuecomment-284787564
// timeout a promise
export function timeout(ms, promise) {
    return new Promise(function(resolve, reject) {
        setTimeout(()=>reject(new Error('TIMEOUT')), ms)
        promise.then(resolve, reject)
    })
}

// http://stackoverflow.com/q/196972/1828637
// consider not proper casing small words - http://php.net/manual/en/function.ucwords.php#84920 - ['of','a','the','and','an','or','nor','but','is','if','then', 'else','when', 'at','from','by','on','off','for','in','out', 'over','to','into','with'];
export function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

export async function wait(ms) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms));
}

export function pushAlternating(aTargetArr, aEntry) {
	// pushes into an array aEntry, every alternating
		// so if aEntry 0
			// [1, 2] becomes [1, 0, 2]
			// [1] statys [1]
			// [1, 2, 3] becomes [1, 0, 2, 0, 3]
	let l = aTargetArr.length;
	for (let i=l-1; i>0; i--) {
		aTargetArr.splice(i, 0, aEntry);
	}

	return aTargetArr;
}

export function genNonce(length) {
	// generates a nonce
    let nonce = '';
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0; i < length; i++) {
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce;
}




// https://stackoverflow.com/a/1499916/1828637
export function stripTags(html) {
    // html is text
    return html.replace(/(<([^>]+)>)/ig, '');
}

// https://stackoverflow.com/a/36566052/1828637
export function wordSimilarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}
function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export function urlencode (str) {
  //       discuss at: http://locutus.io/php/urlencode/
  //      original by: Philip Peterson
  //      improved by: Kevin van Zonneveld (http://kvz.io)
  //      improved by: Kevin van Zonneveld (http://kvz.io)
  //      improved by: Brett Zamir (http://brett-zamir.me)
  //      improved by: Lars Fischer
  //         input by: AJ
  //         input by: travc
  //         input by: Brett Zamir (http://brett-zamir.me)
  //         input by: Ratheous
  //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
  //      bugfixed by: Kevin van Zonneveld (http://kvz.io)
  //      bugfixed by: Joris
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //           note 1: This reflects PHP 5.3/6.0+ behavior
  //           note 1: Please be aware that this function
  //           note 1: expects to encode into UTF-8 encoded strings, as found on
  //           note 1: pages served as UTF-8
  //        example 1: urlencode('Kevin van Zonneveld!')
  //        returns 1: 'Kevin+van+Zonneveld%21'
  //        example 2: urlencode('http://kvz.io/')
  //        returns 2: 'http%3A%2F%2Fkvz.io%2F'
  //        example 3: urlencode('http://www.google.nl/search?q=Locutus&ie=utf-8')
  //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3DLocutus%26ie%3Dutf-8'
  str = (str + '')
  // Tilde should be allowed unescaped in future versions of PHP (as reflected below),
  // but if you want to reflect current
  // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+')
}
