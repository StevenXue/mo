import re
import unicodedata
import string
import random


def generate_args_str(args):
    array = ["%s=%s" % (k, (v if not isinstance(v, str) else "'%s'" % v))
             for k, v in args.items()]
    return ', '.join(array)


# def remove_dot(string):
#     string.replace('.', '')
#     return string


def slugify(value, allow_unicode=False):
    """
    Convert to ASCII if 'allow_unicode' is False. Convert spaces to hyphens.
    Remove characters that aren't alphanumerics, underscores, or hyphens.
    Convert to lowercase. Also strip leading and trailing whitespace.
    """
    if value == '':
        value = 'field' + rand_str(3)

    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode(
            'ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip()
    return re.sub(r'[-\s]+', '-', value)


def rand_str(length):
    return ''.join(
        random.choices(string.ascii_uppercase + string.digits, k=length))


def split_without_empty(string):
    return [x.strip() for x in string.split(',') if x]
