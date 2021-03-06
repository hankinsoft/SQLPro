/**
 * SQL Formatter is a collection of utilities for debugging SQL queries.
 * It includes methods for formatting, syntax highlighting, removing comments, etc.
 *
 * @package    SqlFormatter
 * @author     Jeremy Dorn <jeremy@jeremydorn.com>
 * @author     Florin Patan <florinpatan@gmail.com>
 * @copyright  2013 Jeremy Dorn
 * @license    http://opensource.org/licenses/MIT
 * @link       http://github.com/jdorn/sql-formatter
 * @version    1.2.18
 */
function SqlFormatter()
{
    const TOKEN_TYPE_WHITESPACE = 0;
    const TOKEN_TYPE_WORD = 1;
    const TOKEN_TYPE_QUOTE = 2;
    const TOKEN_TYPE_BACKTICK_QUOTE = 3;
    const TOKEN_TYPE_RESERVED = 4;
    const TOKEN_TYPE_RESERVED_TOPLEVEL = 5;
    const TOKEN_TYPE_RESERVED_NEWLINE = 6;
    const TOKEN_TYPE_BOUNDARY = 7;
    const TOKEN_TYPE_COMMENT = 8;
    const TOKEN_TYPE_BLOCK_COMMENT = 9;
    const TOKEN_TYPE_NUMBER = 10;
    const TOKEN_TYPE_ERROR = 11;
    const TOKEN_TYPE_VARIABLE = 12;
    // Constants for different components of a token
    const TOKEN_TYPE = 0;
    const TOKEN_VALUE = 1;
    
    // Reserved words (for syntax highlighting)
    this.$reserved = [
        'ACCESSIBLE', 'ACTION', 'AGAINST', 'AGGREGATE', 'ALGORITHM', 'ALL', 'ALTER', 'ANALYSE', 'ANALYZE', 'AS', 'ASC',
        'AUTOCOMMIT', 'AUTO_INCREMENT', 'BACKUP', 'BEGIN', 'BETWEEN', 'BINLOG', 'BOTH', 'CASCADE', 'CASE', 'CHANGE', 'CHANGED', 'CHARACTER SET',
        'CHARSET', 'CHECK', 'CHECKSUM', 'COLLATE', 'COLLATION', 'COLUMN', 'COLUMNS', 'COMMENT', 'COMMIT', 'COMMITTED', 'COMPRESSED', 'CONCURRENT',
        'CONSTRAINT', 'CONTAINS', 'CONVERT', 'CREATE', 'CROSS', 'CURRENT_TIMESTAMP', 'DATABASE', 'DATABASES', 'DAY', 'DAY_HOUR', 'DAY_MINUTE',
        'DAY_SECOND', 'DEFAULT', 'DEFINER', 'DELAYED', 'DELETE', 'DESC', 'DESCRIBE', 'DETERMINISTIC', 'DISTINCT', 'DISTINCTROW', 'DIV',
        'DO', 'DUMPFILE', 'DUPLICATE', 'DYNAMIC', 'ELSE', 'ENCLOSED', 'END', 'ENGINE', 'ENGINE_TYPE', 'ENGINES', 'ESCAPE', 'ESCAPED', 'EVENTS', 'EXEC',
        'EXECUTE', 'EXISTS', 'EXPLAIN', 'EXTENDED', 'FAST', 'FIELDS', 'FILE', 'FIRST', 'FIXED', 'FLUSH', 'FOR', 'FORCE', 'FOREIGN', 'FULL', 'FULLTEXT',
        'FUNCTION', 'GLOBAL', 'GRANT', 'GRANTS', 'GROUP_CONCAT', 'HEAP', 'HIGH_PRIORITY', 'HOSTS', 'HOUR', 'HOUR_MINUTE',
        'HOUR_SECOND', 'IDENTIFIED', 'IF', 'IFNULL', 'IGNORE', 'IN', 'INDEX', 'INDEXES', 'INFILE', 'INSERT', 'INSERT_ID', 'INSERT_METHOD', 'INTERVAL',
        'INTO', 'INVOKER', 'IS', 'ISOLATION', 'KEY', 'KEYS', 'KILL', 'LAST_INSERT_ID', 'LEADING', 'LEVEL', 'LIKE', 'LINEAR',
        'LINES', 'LOAD', 'LOCAL', 'LOCK', 'LOCKS', 'LOGS', 'LOW_PRIORITY', 'MARIA', 'MASTER', 'MASTER_CONNECT_RETRY', 'MASTER_HOST', 'MASTER_LOG_FILE',
        'MATCH', 'MAX_CONNECTIONS_PER_HOUR', 'MAX_QUERIES_PER_HOUR', 'MAX_ROWS', 'MAX_UPDATES_PER_HOUR', 'MAX_USER_CONNECTIONS',
        'MEDIUM', 'MERGE', 'MINUTE', 'MINUTE_SECOND', 'MIN_ROWS', 'MODE', 'MODIFY',
        'MONTH', 'MRG_MYISAM', 'MYISAM', 'NAMES', 'NATURAL', 'NOT', 'NOW()', 'NULL', 'OFFSET', 'ON', 'OPEN', 'OPTIMIZE', 'OPTION', 'OPTIONALLY',
        'ON UPDATE', 'ON DELETE', 'OUTFILE', 'PACK_KEYS', 'PAGE', 'PARTIAL', 'PARTITION', 'PARTITIONS', 'PASSWORD', 'PRIMARY', 'PRIVILEGES', 'PROCEDURE',
        'PROCESS', 'PROCESSLIST', 'PURGE', 'QUICK', 'RANGE', 'RAID0', 'RAID_CHUNKS', 'RAID_CHUNKSIZE', 'RAID_TYPE', 'READ', 'READ_ONLY',
        'READ_WRITE', 'REFERENCES', 'REGEXP', 'RELOAD', 'RENAME', 'REPAIR', 'REPEATABLE', 'REPLACE', 'REPLICATION', 'RESET', 'RESTORE', 'RESTRICT',
        'RETURN', 'RETURNS', 'REVOKE', 'RLIKE', 'ROLLBACK', 'ROW', 'ROWS', 'ROW_FORMAT', 'SECOND', 'SECURITY', 'SEPARATOR',
        'SERIALIZABLE', 'SESSION', 'SHARE', 'SHOW', 'SHUTDOWN', 'SLAVE', 'SONAME', 'SOUNDS', 'SQL', 'SQL_AUTO_IS_NULL', 'SQL_BIG_RESULT',
        'SQL_BIG_SELECTS', 'SQL_BIG_TABLES', 'SQL_BUFFER_RESULT', 'SQL_CALC_FOUND_ROWS', 'SQL_LOG_BIN', 'SQL_LOG_OFF', 'SQL_LOG_UPDATE',
        'SQL_LOW_PRIORITY_UPDATES', 'SQL_MAX_JOIN_SIZE', 'SQL_QUOTE_SHOW_CREATE', 'SQL_SAFE_UPDATES', 'SQL_SELECT_LIMIT', 'SQL_SLAVE_SKIP_COUNTER',
        'SQL_SMALL_RESULT', 'SQL_WARNINGS', 'SQL_CACHE', 'SQL_NO_CACHE', 'START', 'STARTING', 'STATUS', 'STOP', 'STORAGE',
        'STRAIGHT_JOIN', 'STRING', 'STRIPED', 'SUPER', 'TABLE', 'TABLES', 'TEMPORARY', 'TERMINATED', 'THEN', 'TO', 'TRAILING', 'TRANSACTIONAL', 'TRUE',
        'TRUNCATE', 'TYPE', 'TYPES', 'UNCOMMITTED', 'UNIQUE', 'UNLOCK', 'UNSIGNED', 'USAGE', 'USE', 'USING', 'VARIABLES',
        'VIEW', 'WHEN', 'WITH', 'WORK', 'WRITE', 'YEAR_MONTH'
    ];

    // For SQL formatting
    // These keywords will all be on their own line

    this.$reserved_toplevel = [
        'SELECT', 'FROM', 'WHERE', 'SET', 'ORDER BY', 'GROUP BY', 'LIMIT', 'DROP',
        'VALUES', 'UPDATE', 'HAVING', 'ADD', 'AFTER', 'ALTER TABLE', 'DELETE FROM', 'UNION ALL', 'UNION', 'EXCEPT', 'INTERSECT', 'GO'
    ];


    this.$reserved_newline = [
        'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN', 'INNER JOIN', 'JOIN', 'XOR', 'OR', 'AND'
    ];


    this.$functions = [
        'ABS', 'ACOS', 'ADDDATE', 'ADDTIME', 'AES_DECRYPT', 'AES_ENCRYPT', 'AREA', 'ASBINARY', 'ASCII', 'ASIN', 'ASTEXT', 'ATAN', 'ATAN2',
        'AVG', 'BDMPOLYFROMTEXT', 'BDMPOLYFROMWKB', 'BDPOLYFROMTEXT', 'BDPOLYFROMWKB', 'BENCHMARK', 'BIN', 'BIT_AND', 'BIT_COUNT', 'BIT_LENGTH',
        'BIT_OR', 'BIT_XOR', 'BOUNDARY', 'BUFFER', 'CAST', 'CEIL', 'CEILING', 'CENTROID', 'CHAR', 'CHARACTER_LENGTH', 'CHARSET', 'CHAR_LENGTH',
        'COALESCE', 'COERCIBILITY', 'COLLATION', 'COMPRESS', 'CONCAT', 'CONCAT_WS', 'CONNECTION_ID', 'CONTAINS', 'CONV', 'CONVERT', 'CONVERT_TZ',
        'CONVEXHULL', 'COS', 'COT', 'COUNT', 'CRC32', 'CROSSES', 'CURDATE', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'CURRENT_USER',
        'CURTIME', 'DATABASE', 'DATE', 'DATEDIFF', 'DATE_ADD', 'DATE_DIFF', 'DATE_FORMAT', 'DATE_SUB', 'DAY', 'DAYNAME', 'DAYOFMONTH', 'DAYOFWEEK',
        'DAYOFYEAR', 'DECODE', 'DEFAULT', 'DEGREES', 'DES_DECRYPT', 'DES_ENCRYPT', 'DIFFERENCE', 'DIMENSION', 'DISJOINT', 'DISTANCE', 'ELT', 'ENCODE',
        'ENCRYPT', 'ENDPOINT', 'ENVELOPE', 'EQUALS', 'EXP', 'EXPORT_SET', 'EXTERIORRING', 'EXTRACT', 'EXTRACTVALUE', 'FIELD', 'FIND_IN_SET', 'FLOOR',
        'FORMAT', 'FOUND_ROWS', 'FROM_DAYS', 'FROM_UNIXTIME', 'GEOMCOLLFROMTEXT', 'GEOMCOLLFROMWKB', 'GEOMETRYCOLLECTION', 'GEOMETRYCOLLECTIONFROMTEXT',
        'GEOMETRYCOLLECTIONFROMWKB', 'GEOMETRYFROMTEXT', 'GEOMETRYFROMWKB', 'GEOMETRYN', 'GEOMETRYTYPE', 'GEOMFROMTEXT', 'GEOMFROMWKB', 'GET_FORMAT',
        'GET_LOCK', 'GLENGTH', 'GREATEST', 'GROUP_CONCAT', 'GROUP_UNIQUE_USERS', 'HEX', 'HOUR', 'IF', 'IFNULL', 'INET_ATON', 'INET_NTOA', 'INSERT', 'INSTR',
        'INTERIORRINGN', 'INTERSECTION', 'INTERSECTS', 'INTERVAL', 'ISCLOSED', 'ISEMPTY', 'ISNULL', 'ISRING', 'ISSIMPLE', 'IS_FREE_LOCK', 'IS_USED_LOCK',
        'LAST_DAY', 'LAST_INSERT_ID', 'LCASE', 'LEAST', 'LEFT', 'LENGTH', 'LINEFROMTEXT', 'LINEFROMWKB', 'LINESTRING', 'LINESTRINGFROMTEXT', 'LINESTRINGFROMWKB',
        'LN', 'LOAD_FILE', 'LOCALTIME', 'LOCALTIMESTAMP', 'LOCATE', 'LOG', 'LOG10', 'LOG2', 'LOWER', 'LPAD', 'LTRIM', 'MAKEDATE', 'MAKETIME', 'MAKE_SET',
        'MASTER_POS_WAIT', 'MAX', 'MBRCONTAINS', 'MBRDISJOINT', 'MBREQUAL', 'MBRINTERSECTS', 'MBROVERLAPS', 'MBRTOUCHES', 'MBRWITHIN', 'MD5', 'MICROSECOND',
        'MID', 'MIN', 'MINUTE', 'MLINEFROMTEXT', 'MLINEFROMWKB', 'MOD', 'MONTH', 'MONTHNAME', 'MPOINTFROMTEXT', 'MPOINTFROMWKB', 'MPOLYFROMTEXT', 'MPOLYFROMWKB',
        'MULTILINESTRING', 'MULTILINESTRINGFROMTEXT', 'MULTILINESTRINGFROMWKB', 'MULTIPOINT', 'MULTIPOINTFROMTEXT', 'MULTIPOINTFROMWKB', 'MULTIPOLYGON',
        'MULTIPOLYGONFROMTEXT', 'MULTIPOLYGONFROMWKB', 'NAME_CONST', 'NULLIF', 'NUMGEOMETRIES', 'NUMINTERIORRINGS', 'NUMPOINTS', 'OCT', 'OCTET_LENGTH',
        'OLD_PASSWORD', 'ORD', 'OVERLAPS', 'PASSWORD', 'PERIOD_ADD', 'PERIOD_DIFF', 'PI', 'POINT', 'POINTFROMTEXT', 'POINTFROMWKB', 'POINTN', 'POINTONSURFACE',
        'POLYFROMTEXT', 'POLYFROMWKB', 'POLYGON', 'POLYGONFROMTEXT', 'POLYGONFROMWKB', 'POSITION', 'POW', 'POWER', 'QUARTER', 'QUOTE', 'RADIANS', 'RAND',
        'RELATED', 'RELEASE_LOCK', 'REPEAT', 'REPLACE', 'REVERSE', 'RIGHT', 'ROUND', 'ROW_COUNT', 'RPAD', 'RTRIM', 'SCHEMA', 'SECOND', 'SEC_TO_TIME',
        'SESSION_USER', 'SHA', 'SHA1', 'SIGN', 'SIN', 'SLEEP', 'SOUNDEX', 'SPACE', 'SQRT', 'SRID', 'STARTPOINT', 'STD', 'STDDEV', 'STDDEV_POP', 'STDDEV_SAMP',
        'STRCMP', 'STR_TO_DATE', 'SUBDATE', 'SUBSTR', 'SUBSTRING', 'SUBSTRING_INDEX', 'SUBTIME', 'SUM', 'SYMDIFFERENCE', 'SYSDATE', 'SYSTEM_USER', 'TAN',
        'TIME', 'TIMEDIFF', 'TIMESTAMP', 'TIMESTAMPADD', 'TIMESTAMPDIFF', 'TIME_FORMAT', 'TIME_TO_SEC', 'TOUCHES', 'TO_DAYS', 'TRIM', 'TRUNCATE', 'UCASE',
        'UNCOMPRESS', 'UNCOMPRESSED_LENGTH', 'UNHEX', 'UNIQUE_USERS', 'UNIX_TIMESTAMP', 'UPDATEXML', 'UPPER', 'USER', 'UTC_DATE', 'UTC_TIME', 'UTC_TIMESTAMP',
        'UUID', 'VARIANCE', 'VAR_POP', 'VAR_SAMP', 'VERSION', 'WEEK', 'WEEKDAY', 'WEEKOFYEAR', 'WITHIN', 'X', 'Y', 'YEAR', 'YEARWEEK'
    ];

    // Punctuation that can be used as a boundary between other tokens

    this.$boundaries = [',', ';', '::', ':', ')', '(', '.', '=', '<', '>', '+', '-', '*', '/', '!', '^', '%', '|', '&', '#'];

    // The tab character to use when formatting SQL
    this.$tab = "    ";

    // This flag tells us if SqlFormatted has been initialized

    this.$init;

    // Regular expressions for tokenizing

    this.$regex_boundaries;

    this.$regex_reserved;

    this.$regex_reserved_newline;

    this.$regex_reserved_toplevel;

    this.$regex_function;

    // Cache variables
    // Only tokens shorter than this size will be cached.  Somewhere between 10 and 20 seems to work well for most cases.
    this.$max_cachekey_size = 15;

    this.$token_cache = [];

    this.$cache_hits = 0;

    this.$cache_misses = 0;

    /**
     * Stuff that only needs to be done once.  Builds regular expressions and sorts the reserved words.
     */
    this.init = function()
    {
        if (this.$init) return;

        // Sort reserved word list from longest word to shortest, 3x faster than usort
        var $reservedMap = [];
        var $reservedMapObjArray = {};

        $reservedMap = this.$reserved.map(function(key) {
            //$reservedMapObjArray[key.length] = key
            var result = {};
			result[key] = key.length;

			return result;
        });

        $reservedMap = arsort($reservedMap);

        this.$reserved = getJsonArrayKeys($reservedMap);

        // Set up regular expressions
        this.$regex_boundaries = '(' + this.$boundaries.map(quote_regex).join("|") + ')';
        this.$regex_reserved = '(' + this.$reserved.map(quote_regex).join("|") + ')';
        this.$regex_reserved_toplevel = '(' + this.$reserved_toplevel.map(quote_regex).join("|") + ')'.replace(' ', '\\s+');

        this.$regex_reserved_newline = '(' + this.$reserved_newline.map(quote_regex).join("|") + ')'.replace(' ', '\\s+');
        this.$regex_function = '(' + this.$functions.map(quote_regex).join("|") + ')';

        this.$init = true;
    }

    /**
     * Return the next token and token type in a SQL string.
     * Quoted strings, comments, reserved words, whitespace, and punctuation are all their own tokens.
     *
     * @param String $string   The SQL string
     * @param array  $previous The result of the previous getNextToken() call
     *
     * @return Array An associative array containing the type and value of the token.
     */
    this.getNextToken = function($string)
    {
        // Whitespace
        if (preg_match('^\\s+', $string))
        {
            const $matches = $string.match('^\\s+');
            
            var result = {};
            result[TOKEN_VALUE] = $matches[0];
            result[TOKEN_TYPE] = TOKEN_TYPE_WHITESPACE;
            return result;
        }

        // Comment
        if ($string[0] === '#' || ($string[1] && (($string[0] === '-' && $string[1] === '-') || ($string[0] === '/' && $string[1] === '*'))))
        {
            // Comment until end of line
            var $last, $type;
            if ($string[0] === '-' || $string[0] === '#')
            {
                $last = strpos($string, "\n");
                $type = TOKEN_TYPE_COMMENT;
            }
            else
            { // Comment until closing comment tag
                $last = strpos($string, "*/", 2) + 2;
                $type = TOKEN_TYPE_BLOCK_COMMENT;
            }

            if ($last === false)
            {
                $last = strlen($string);
            }

			var result = {};
			result[TOKEN_VALUE] = $string.substr(0, $last);
			result[TOKEN_TYPE] = $type;
            return result;
        }

        // Quoted String
        if ($string[0] === '"' || $string[0] === '\'' || $string[0] === '`' || $string[0] === '[')
        {
	        var result = {};
	        result[TOKEN_TYPE] = (($string[0] === '`' || $string[0] === '[') ? TOKEN_TYPE_BACKTICK_QUOTE : TOKEN_TYPE_QUOTE);
	        result[TOKEN_VALUE] = getQuotedString($string);

            return result;
        }

        // User-defined Variable
        if (($string[0] === '@' || $string[0] === ':') && $string[1])
        {
	        var $ret = {};
	        $ret[TOKEN_VALUE] = null;
			$ret[TOKEN_TYPE] = TOKEN_TYPE_VARIABLE;

            // If the variable name is quoted
            if ($string[1] === '"' || $string[1] === '\'' || $string[1] === '`')
            {
                $ret[TOKEN_VALUE] = $string[0].getQuotedString($string.substr(1));
            }
            // Non-quoted variable name
            else
            {
                //preg_match('/^(' + $string[0] + '[a-zA-Z0-9\._\$]+)/',$string);
                const $matches = preg_match_str('^(' + $string[0] + '[a-zA-Z0-9\._\$]+)', $string);
                if ($matches)
                {
                    $ret[TOKEN_VALUE] = $matches[1];
                }
            }

            if ($ret[TOKEN_VALUE] !== null) return $ret;
        }

        // Number (decimal, binary, or hex)
        if (preg_match('^([0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+)($|\\s|"\'`|' + this.$regex_boundaries + ')', $string))
        {
            const $matches = preg_match_str('^([0-9]+(\.[0-9]+)?|0x[0-9a-fA-F]+|0b[01]+)($|\\s|"\'`|' + this.$regex_boundaries + ')', $string);
            
            var result = {};
			result[TOKEN_VALUE] = $matches[1];
			result[TOKEN_TYPE] = TOKEN_TYPE_NUMBER;
            return result;
        }

        // Boundary Character (punctuation and symbols)
        if (preg_match('^(' + this.$regex_boundaries + ')', $string))
        {
            const $matches = preg_match_str('^(' + this.$regex_boundaries + ')', $string);

            var result = {};
			result[TOKEN_VALUE] = $matches[1];
			result[TOKEN_TYPE] = TOKEN_TYPE_BOUNDARY;

			return result;
        }

        var $previous;

        // A reserved word cannot be preceded by a '.'
        // this makes it so in "mytable.from", "from" is not considered a reserved word
        if (!$previous || !$previous[TOKEN_VALUE] || $previous[TOKEN_VALUE] !== '.')
        {
            var $upper = strtoupper($string);

            // Top Level Reserved Word
            if (preg_match('^(' + this.$regex_reserved_toplevel + ')($|\\s|' + this.$regex_boundaries + ')', $upper))
            {
                const $matches = preg_match_str('^(' + this.$regex_reserved_toplevel + ')($|\\s|' + this.$regex_boundaries + ')', $upper);
                
                var result = {};
				result[TOKEN_TYPE] = TOKEN_TYPE_RESERVED_TOPLEVEL;
				result[TOKEN_VALUE] = substr($string, 0, $matches[1].length);
				return result;
            }

            // Newline Reserved Word
            if (preg_match('^(' + this.$regex_reserved_newline + ')($|\\s|' + this.$regex_boundaries + ')', $upper))
            {
                const $matches = preg_match_str('^(' + this.$regex_reserved_newline + ')($|\\s|' + this.$regex_boundaries + ')', $upper)
                
                var result = {};

				result[TOKEN_TYPE] = TOKEN_TYPE_RESERVED_NEWLINE;
				result[TOKEN_VALUE] = substr($string, 0, strlen($matches[1]));
				return result;
            }
            // Other Reserved Word
            if (preg_match('^(' + this.$regex_reserved + ')($|\\s|' + this.$regex_boundaries + ')', $upper))
            {
                const $matches = preg_match_str('^(' + this.$regex_reserved + ')($|\\s|' + this.$regex_boundaries + ')', $upper);

				var result = Array();
				result[TOKEN_TYPE] = TOKEN_TYPE_RESERVED;
				result[TOKEN_VALUE] = substr($string, 0, strlen($matches[1]));
				return result;
            }
        }

        // A function must be suceeded by '('
        // this makes it so "count(" is considered a function, but "count" alone is not
        var $upper = strtoupper($string);

        // function
        if (preg_match('^(' + this.$regex_function + '[(]|\\s|[)])', $upper))
        {
            const $matches = preg_match_str('^(' + this.$regex_function + '[(]|\\s|[)])', $upper);
            var result = {};
			result[TOKEN_TYPE] = TOKEN_TYPE_RESERVED;
			result[TOKEN_VALUE] = substr($string, 0, strlen($matches[1]) - 1);
			return result;
        }

        // Non reserved word
        preg_match('^(.*?)($|\\s|["\'`]|' + this.$regex_boundaries + ')', $string);
        //const regex = /^(.*?)($|\s|["\'`]| + this.$regex_boundaries + )/;
        const $matches = preg_match_str('^(.*?)($|\\s|["\'`]|' + this.$regex_boundaries + ')', $string);
        
        var result = {};
		result[TOKEN_VALUE] = $matches[1];
		result[TOKEN_TYPE] = TOKEN_TYPE_WORD;

        return result;
    };

    /**
     * Takes a SQL string and breaks it into tokens.
     * Each token is an associative array with type and value.
     *
     * @param String $string The SQL string
     *
     * @return Array An array of tokens.
     */
    this.tokenize = function($string)
    {
        this.init();

        var $tokens = [];

        // Used for debugging if there is an error while tokenizing the string
        const $original_length = strlen($string);

        // Used to make sure the string keeps shrinking on each iteration
        var $old_string_len = strlen($string) + 1;

        var $token = null,
            $token_length = 0;

        var $current_length = strlen($string);

        // Keep processing the string until it is empty
        while ($current_length)
        {
            // If the string stopped shrinking, there was a problem
            if ($old_string_len <= $current_length)
            {
	            var result = {};
				result[TOKEN_VALUE] = $string;
				result[TOKEN_TYPE] = TOKEN_TYPE_ERROR;
                $tokens.push(result);

                return $tokens;
            }
            $old_string_len = $current_length;

            // Determine if we can use caching
            var $cacheKey;
            if ($current_length >= this.$max_cachekey_size)
            {
                $cacheKey = $string.substr(0, this.$max_cachekey_size);
            }
            else
            {
                $cacheKey = false;
            }

            // See if the token is already cached
            if ($cacheKey && this.$token_cache[$cacheKey])
            {
                // Retrieve from cache
                $token = this.$token_cache[$cacheKey];
                $token_length = strlen($token[TOKEN_VALUE]);
                this.$cache_hits++;
            }
            else
            {
                // Get the next token and the token type
                $token = this.getNextToken($string, $token);
                $token_length = strlen($token[TOKEN_VALUE]);
                this.$cache_misses++;

                // If the token is shorter than the max length, store it in cache
                if ($cacheKey && $token_length < this.$max_cachekey_size)
                {
                    this.$token_cache[$cacheKey] = $token;
                }
            }

            $tokens.push($token);

            // Advance the string
            $string = substr($string, $token_length);

            $current_length -= $token_length;
        }

        return $tokens;
    };

    /**
     * Format the whitespace in a SQL string to make it easier to read.
     *
     * @param String  $string    The SQL string
     * @param boolean $highlight If true, syntax highlighting will also be performed
     *
     * @return String The SQL string with HTML styles and formatting wrapped in a <pre> tag
     */
    this.format = function($string)
    {
        // This variable will be populated with formatted html
        var $return = '';

        // Use an actual tab while formatting and then switch out with this.$tab at the end
        var $tab = "\t";

        var $indent_level = 0;
        var $newline = false;
        var $inline_parentheses = false;
        var $increase_special_indent = false;
        var $increase_block_indent = false;
        var $indent_types = [];
        var $added_newline = false;
        var $inline_count = 0;
        var $inline_indented = false;
        var $clause_limit = false;

        // Tokenize String

        var $original_tokens = this.tokenize($string);

        //Remove existing whitespace
        var $tokens = [];

        $tokens = $original_tokens.filter(function($token, $i)
        {
            if ($token[TOKEN_TYPE] !== TOKEN_TYPE_WHITESPACE)
            {
                $token['i'] = $i;
                return $token;
            }
        });

        // Format token by token
        var $highlighted;
        $tokens.map(function($token, $i)
        {
            // Get highlighted token if doing syntax highlighting
            $highlighted = $token[TOKEN_VALUE];

            // If we are increasing the special indent level now
            if ($increase_special_indent)
            {
                $indent_level++;
                $increase_special_indent = false;
                $indent_types.unshift('special');
            }

            // If we are increasing the block indent level now
            if ($increase_block_indent)
            {
                $indent_level++;
                $increase_block_indent = false;
                $indent_types.unshift('block');
            }
            // If we need a new line before the token
            if ($newline)
            {
                $return += "\n" + str_repeat($tab, $indent_level);
                $newline = false;
                $added_newline = true;
            }
            else
            {
                $added_newline = false;
            }

            // Display comments directly where they appear in the source
            if ($token[TOKEN_TYPE] === TOKEN_TYPE_COMMENT || $token[TOKEN_TYPE] === TOKEN_TYPE_BLOCK_COMMENT)
            {
                if ($token[TOKEN_TYPE] === TOKEN_TYPE_BLOCK_COMMENT)
                {
                    var $indent = str_repeat($tab, $indent_level);
                    $return += "\n" + $indent;
                    $highlighted = str_replace("\n", "\n" + $indent, $highlighted);
                }

                $return += $highlighted;
                $newline = true;
                return;
            }

            if ($inline_parentheses)
            {
                // End of inline parentheses
                if ($token[TOKEN_VALUE] === ')')
                {
                    $return = rtrim($return, ' ');

                    if ($inline_indented)
                    {
                        $indent_types.shift();
                        $indent_level--;
                        $return += "\n" + str_repeat($tab, $indent_level);
                    }

                    $inline_parentheses = false;

                    $return += $highlighted + ' ';
                    return;
                }

                if ($token[TOKEN_VALUE] === ',')
                {
                    if ($inline_count >= 30)
                    {
                        $inline_count = 0;
                        $newline = true;
                    }
                }

                $inline_count += strlen($token[TOKEN_VALUE]);
            }

            // Opening parentheses increase the block indent level and start a new line
            if ($token[TOKEN_VALUE] === '(')
            {
                // First check if this should be an inline parentheses block
                // Examples are "NOW()", "COUNT(*)", "int(10)", key(`somecolumn`), DECIMAL(7,2)
                // Allow up to 3 non-whitespace tokens inside inline parentheses
                var $length = 0;
                for (var $j = 1; $j <= 250; $j++)
                {
                    // Reached end of string
                    if (!$tokens[$i + $j]) break;

                    var $next = $tokens[$i + $j];

                    // Reached closing parentheses, able to inline it
                    if ($next[TOKEN_VALUE] === ')')
                    {
                        $inline_parentheses = true;
                        $inline_count = 0;
                        $inline_indented = false;
                        break;
                    }

                    // Reached an invalid token for inline parentheses
                    if ($next[TOKEN_VALUE] === ';' || $next[TOKEN_VALUE] === '(')
                    {
                        break;
                    }

                    // Reached an invalid token type for inline parentheses
                    if ($next[TOKEN_TYPE] === TOKEN_TYPE_RESERVED_TOPLEVEL || $next[TOKEN_TYPE] === TOKEN_TYPE_RESERVED_NEWLINE || $next[TOKEN_TYPE] === TOKEN_TYPE_COMMENT || $next[TOKEN_TYPE] === TOKEN_TYPE_BLOCK_COMMENT)
                    {
                        break;
                    }

                    $length += parseInt(strlen($next[TOKEN_VALUE]), 10);
                }

                if ($inline_parentheses && $length > 30)
                {
                    $increase_block_indent = true;
                    $inline_indented = true;
                    $newline = true;
                }

                // Take out the preceding space unless there was whitespace there in the original query
                if ($original_tokens[$token['i'] - 1] && $original_tokens[$token['i'] - 1][TOKEN_TYPE] !== TOKEN_TYPE_WHITESPACE)
                {
                    $return = rtrim($return, ' ');
                }

                if (!$inline_parentheses)
                {
                    $increase_block_indent = true;
                    // Add a newline after the parentheses
                    $newline = true;
                }

            }

            // Closing parentheses decrease the block indent level
            else if ($token[TOKEN_VALUE] === ')')
            {
                // Remove whitespace before the closing parentheses
                $return = rtrim($return, ' ');

                $indent_level--;

                // Reset indent level
                var $j;
                while ($j = $indent_types.shift())
                {
                    if ($j === 'special')
                    {
                        $indent_level--;
                    }
                    else
                    {
                        break;
                    }
                }

                if ($indent_level < 0)
                {
                    // This is an error
                    $indent_level = 0;
                }

                // Add a newline before the closing parentheses (if not already added)
                if (!$added_newline)
                {
                    $return += "\n" + str_repeat($tab, $indent_level);
                }
            }

            // Top level reserved words start a new line and increase the special indent level
            else if ($token[TOKEN_TYPE] === TOKEN_TYPE_RESERVED_TOPLEVEL)
            {
                $increase_special_indent = true;

                // If the last indent type was 'special', decrease the special indent for this round
                console.log('reset');
                console.log($indent_types);
                reset($indent_types);
                console.log($indent_types);
                console.log('done reset');
                if ($indent_types[0] === 'special')
                {
                    $indent_level--;
                    $indent_types.shift();
                }

                // Add a newline after the top level reserved word
                $newline = true;
                // Add a newline before the top level reserved word (if not already added)
                if (!$added_newline)
                {
                    $return += "\n" + str_repeat($tab, $indent_level);
                }
                // If we already added a newline, redo the indentation since it may be different now
                else
                {
                    $return = rtrim($return, $tab) + str_repeat($tab, $indent_level);
                }

                // If the token may have extra whitespace
                if (strpos($token[TOKEN_VALUE], ' ') !== false || strpos($token[TOKEN_VALUE], "\n") !== false || strpos($token[TOKEN_VALUE], "\t") !== false)
                {
                    $highlighted = $highlighted.replace(/\s+/g, ' ');
                }
                //if SQL 'LIMIT' clause, start variable to reset newline
                if ($token[TOKEN_VALUE] === 'LIMIT' && !$inline_parentheses)
                {
                    $clause_limit = true;
                }
            }

            // Checks if we are out of the limit clause
            else if ($clause_limit && $token[TOKEN_VALUE] !== "," && $token[TOKEN_TYPE] !== TOKEN_TYPE_NUMBER && $token[TOKEN_TYPE] !== TOKEN_TYPE_WHITESPACE)
            {
                $clause_limit = false;
            }

            // Commas start a new line (unless within inline parentheses or SQL 'LIMIT' clause)
            else if ($token[TOKEN_VALUE] === ',' && !$inline_parentheses)
            {
                //If the previous TOKEN_VALUE is 'LIMIT', resets new line
                if ($clause_limit === true)
                {
                    $newline = false;
                    $clause_limit = false;
                }
                // All other cases of commas
                else
                {
                    $newline = true;
                }
            }

            // Newline reserved words start a new line
            else if ($token[TOKEN_TYPE] === TOKEN_TYPE_RESERVED_NEWLINE)
            {
                // Add a newline before the reserved word (if not already added)
                if (!$added_newline)
                {
                    $return += "\n" + str_repeat($tab, $indent_level);
                }

                // If the token may have extra whitespace
                if (strpos($token[TOKEN_VALUE], ' ') !== false || strpos($token[TOKEN_VALUE], "\n") !== false || strpos($token[TOKEN_VALUE], "\t") !== false)
                {
                    $highlighted = $highlighted.replace(/\s+/g, ' ');
                }
            }

            // Multiple boundary characters in a row should not have spaces between them (not including parentheses)
            else if ($token[TOKEN_TYPE] === TOKEN_TYPE_BOUNDARY)
            {
                if (($tokens[$i - 1]) && $tokens[$i - 1][TOKEN_TYPE] === TOKEN_TYPE_BOUNDARY)
                {
                    if (($original_tokens[$token['i'] - 1]) && $original_tokens[$token['i'] - 1][TOKEN_TYPE] !== TOKEN_TYPE_WHITESPACE)
                    {
                        $return = rtrim($return, ' ');
                    }
                }
            }

            // If the token shouldn't have a space before it
            if ($token[TOKEN_VALUE] === '.' ||
                $token[TOKEN_VALUE] === ',' ||
                $token[TOKEN_VALUE] === '::' ||
                $token[TOKEN_VALUE] === ';')
            {
                $return = rtrim($return, ' ');
            }

            $return += $highlighted + ' ';

            // If the token shouldn't have a space after it
            if ($token[TOKEN_VALUE] === '(' ||
                $token[TOKEN_VALUE] === '.' ||
                $token[TOKEN_VALUE] === '::')
            {
                $return = rtrim($return, ' ');
            }

            // If this is the "-" of a negative number, it shouldn't have a space after it
            if ($token[TOKEN_VALUE] === '-' && ($tokens[$i + 1]) && $tokens[$i + 1][TOKEN_TYPE] === TOKEN_TYPE_NUMBER && ($tokens[$i - 1]))
            {
                var $prev = $tokens[$i - 1][TOKEN_TYPE];
                if ($prev !== TOKEN_TYPE_QUOTE && $prev !== TOKEN_TYPE_BACKTICK_QUOTE && $prev !== TOKEN_TYPE_WORD && $prev !== TOKEN_TYPE_NUMBER)
                {
                    $return = rtrim($return, ' ');
                }
            }
        });

        // Replace tab characters with the configuration tab character
        $return = trim(str_replace("\t", this.$tab, $return));
        $return = $return.replace(/ \./g, '.')

        return $return;
    };
}

function formatQuery(queryToFormat)
{
    const sqlObj = new SqlFormatter();
    var result = sqlObj.format(queryToFormat);

    return result;
} // End of formatQuery