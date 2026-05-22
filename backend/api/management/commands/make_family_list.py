from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os

from datetime import datetime

class Command(BaseCommand):

    def handle(self, *args, **options):
        registered_families = Family.objects.filter(registration_submitted=True)
        franchise_dict = {
            'blue' : [],
            'forest' : [],
            'navy' : [],
            'maroon' : []
        } 

        for family in registered_families:
            family_dict = util.get_family_people_categories(family)
            franchise_list = util.get_family_franchises(family)
            if len(franchise_list):
                franchise = franchise_list[0]
            else:
                continue
            family_dict['family'] = family
            family_dict['franchise'] = franchise

            franchise_dict[franchise.lower()].append(family_dict)

        for franchise, family_list in franchise_dict.items():
            out_lines = []
            family_list.sort(key=lambda x: x["family"].family_name)
            for family_object in family_list:
                primary_person = util.get_primary_parent_from_family(family_object['family'])
                family_contact_info = util.get_contact_info(primary_person)
                out_lines.append("# %s" % family_object["family"].family_name)
                out_lines.append("**Address:** %s" % family_contact_info['address'])
                out_lines.append('')
                for parent in family_object["parents"]:
                    contact_info = util.get_contact_info(parent)
                    out_lines.append("- **%s %s** email: %s, phone: %s" % (parent.first_name, parent.last_name, contact_info['email'], contact_info['phone']))
                
                for player in family_object["players"]:
                    out_lines.append("- **%s %s** (player) (dob: %s)" % (player.first_name, player.last_name, player.date_of_birth))

                for person in family_object["other"]:
                    out_lines.append("- **%s %s**" % (person.first_name, person.last_name))

                out_lines.append('')

                out_lines.append("**Family volunteer roles:** %s" % ", ".join(util.get_volunteer_positions(family_object['family'])))

                out_lines.append('')
                
            out_file = "/tmp/%s-family-summary.md" % franchise
            with open(out_file, 'w') as out_handle:
                for line in out_lines:
                    out_handle.write(line)
                    out_handle.write("\n")
            

