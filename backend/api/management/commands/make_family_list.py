from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os

from datetime import datetime

class Command(BaseCommand):

    def handle(self, *args, **options):
        registered_families = Family.objects.filter(registration_submitted=True)
        for family in registered_families:
            family_dict = util.get_family_people_categories(family)
            family_dict['franchise'] = util.get_family_franchises(family)[0]

            out_lines = []
            for parent in family_dict["parents"]:
                contact_info = util.get_contact_info(parent)
                out_lines.append("%s %s, email: %s, phone: %s" % (parent.first_name, parent.last_name, contact_info['email'], contact_info['phone']))
            
            for player in family_dict["players"]:
                out_lines.append("%s %s (player)" % (player.first_name, player.last_name))

            for person in family_dict["other"]:
                out_lines.append("%s %s" % (person.first_name, person.last_name))
            
            
