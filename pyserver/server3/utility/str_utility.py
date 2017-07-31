import re
import unicodedata


def generate_args_str(args):
    array = ["%s=%s" % (k, (v if not isinstance(v, str) else "'%s'" % v))
             for k, v in args.items()]
    return ', '.join(array)


def slugify(value, allow_unicode=False):
    """
    Convert to ASCII if 'allow_unicode' is False. Convert spaces to hyphens.
    Remove characters that aren't alphanumerics, underscores, or hyphens.
    Convert to lowercase. Also strip leading and trailing whitespace.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii',
                                                            'ignore').decode(
            'ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip()
    return re.sub(r'[-\s]+', '-', value)
