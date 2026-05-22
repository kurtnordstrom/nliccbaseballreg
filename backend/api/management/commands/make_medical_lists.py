from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os

from datetime import datetime

class Command(BaseCommand):

    def handle(self, *args, **options):

        franchise_dict = {
            'blue' : [],
            'forest' : [],
            'navy' : [],
            'maroon' : []
        } 

        for person in Person.objects.all():
            if not person.family.registration_submitted:
                continue

            if not person.medical_experience:
                continue

            franchise = util.get_franchise(person)


            franchise_dict[franchise.lower()].append(person)

        for franchise, person_list in franchise_dict.items():
            out_lines = []
            person_list.sort(key=lambda x: x.last_name)
            for person in person_list:
                contact_info = util.get_contact_info(person)
                out_lines.append("## %s %s" % (person.first_name, person.last_name))
                out_lines.append("- **Medical Experience**: %s" % person.medical_experience)
                out_lines.append("- **Phone Number**: %s" % contact_info['phone'])
                out_lines.append('')

                
            out_file = "/tmp/%s-medical-summary.md" % franchise
            with open(out_file, 'w') as out_handle:
                for line in out_lines:
                    out_handle.write(line)
                    out_handle.write("\n")