function preg_quote(str, delimiter)
{
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&')
}

function preg_match(regex, str)
{
    return (new RegExp(regex).test(str))
}

function preg_match_str(regex, str)
{
    const regex1 = new RegExp(regex);

    return (str.match(regex1))
}

function strpos(haystack, needle, offset)
{
    var i = (haystack + '').indexOf(needle, (offset || 0))
    return i === -1 ? false : i
}

function strtoupper(str)
{
    return (str + '').toUpperCase()
}

function substr(str, start, len)
{
    var result = str.substr(start, len);
    return result;
}

function strlen(string)
{
    var length = string.length;
    return length;
} // End of strlen

function str_repeat(input, multiplier)
{

    var y = ''
    while (true)
    {
        if (multiplier & 1)
        {
            y += input
        }
        multiplier >>= 1
        if (multiplier)
        {
            input += input
        }
        else
        {
            break
        }
    }
    return y
}

function str_replace(search, replace, subject)
{
    var result = subject.replace(search, replace);
    return result;
} // End of str_replace

function rtrim(str, charlist)
{
    charlist = !charlist ? ' \\s\u00A0' : (charlist + '')
        .replace(/([[\]().?*/{}+$^:])/g, '\\$1')

    var re = new RegExp('[' + charlist + ']+$', 'g')

    return (str + '').replace(re, '')
}

function reset(arr)
{
    if (arr.length === 0)
    {
        return false
    }

    var $global = (typeof window !== 'undefined' ? window : global)

    $global.$locutus = $global.$locutus ||
    {}
    var $locutus = $global.$locutus
    $locutus.php = $locutus.php ||
    {}
    $locutus.php.pointers = $locutus.php.pointers || []
    var pointers = $locutus.php.pointers

    var indexOf = function(value)
    {
        for (var i = 0, length = this.length; i < length; i++)
        {
            if (this[i] === value)
            {
                return i
            }
        }
        return -1
    }

    if (!pointers.indexOf)
    {
        pointers.indexOf = indexOf
    }

    if (pointers.indexOf(arr) === -1)
    {
        pointers.push(arr, 0)
    }

    var arrpos = pointers.indexOf(arr)
    if (Object.prototype.toString.call(arr) !== '[object Array]')
    {
        for (var k in arr)
        {
            if (pointers.indexOf(arr) === -1)
            {
                pointers.push(arr, 0)
            }
            else
            {
                pointers[arrpos + 1] = 0
            }

            return arr[k]
        }
        // Empty
        return false
    }

    pointers[arrpos + 1] = 0
    return arr[pointers[arrpos + 1]]
}

function array_search(needle, haystack)
{
    var result = haystack.includes(needle);
    return result;
}

function trim(str, charlist)
{

    var whitespace = [
        ' ',
        '\n',
        '\r',
        '\t',
        '\f',
        '\x0b',
        '\xa0',
        '\u2000',
        '\u2001',
        '\u2002',
        '\u2003',
        '\u2004',
        '\u2005',
        '\u2006',
        '\u2007',
        '\u2008',
        '\u2009',
        '\u200a',
        '\u200b',
        '\u2028',
        '\u2029',
        '\u3000'
    ].join('')
    var l = 0
    var i = 0
    str += ''

    if (charlist)
    {
        whitespace = (charlist + '').replace(/([[\]().?*/{}+$^:])/g, '$1')
    }

    l = str.length
    for (i = 0; i < l; i++)
    {
        if (whitespace.indexOf(str.charAt(i)) === -1)
        {
            str = str.substring(i)
            break
        }
    }

    l = str.length
    for (i = l - 1; i >= 0; i--)
    {
        if (whitespace.indexOf(str.charAt(i)) === -1)
        {
            str = str.substring(0, i + 1)
            break
        }
    }

    return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
}

function strlen(aString)
{
    if (aString == null)
    {
        return 0;
    }
    return aString.length;
}

function getQuotedString($string)
{
    var $ret = '';

    // This checks for the following patterns:
    // 1. backtick quoted string using `` to escape
    // 2. square bracket quoted string (SQL Server) using ]] to escape
    // 3. double quoted string using "" or \" to escape
    // 4. single quoted string using '' or \' to escape
    if (preg_match('^(((`[^`]*($|`))+)|((\\[[^\\]]*($|\]))(\][^\]]*($|\]))*)|(("[^"\\\\]*(?:\\\\.[^"\\\\]*)*("|$))+)|((\'[^\'\\\\]*(?:\\\\.[^\'\\\\]*)*(\'|$))+))', $string))
    {
        const $matches = preg_match_str('^(((`[^`]*($|`))+)|((\\[[^\\]]*($|\]))(\][^\]]*($|\]))*)|(("[^"\\\\]*(?:\\\\.[^"\\\\]*)*("|$))+)|((\'[^\'\\\\]*(?:\\\\.[^\'\\\\]*)*(\'|$))+))', $string);

        $ret = $matches[1];
    }

    return $ret;
}

function getJsonArrayKeys(reservedMap)
{
	var results = [];
	for (index = 0; index < reservedMap.length; ++index)
	{
		var obj = reservedMap[index];
		var key = Object.keys(obj)[0];
		results.push(key);
	}

	return results;
}

function arsort(reservedMap)
{
	function compareReserveMap(a, b) {
		var a = parseInt(b[Object.keys(b)[0]], 10);
		var b = parseInt(a[Object.keys(a)[0]], 10);
		  if (a > b) return 1;
		  if (b > a) return -1;
		
		  return 0;
	};

	var result = reservedMap.sort(compareReserveMap);

	return result;
}

function quote_regex($a)
{
    return preg_quote($a, '/');
}