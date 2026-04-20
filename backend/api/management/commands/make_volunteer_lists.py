from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import csv, os


from datetime import datetime

class Command(BaseCommand):
    def handle(self, *args, **options):
        nowdate = datetime.now()
        role_list = [ "SCOREKEEPER", "UMPIRE", "CONCESSIONS", "LOST_AND_FOUND", "SNACK COORDINATOR", "SCOREBOARD_OPERATOR", "PROPERTY_ASSISTANT", "FIELD_ASSISTANT" ]

        for role_name in role_list:
            persons_with_role = []
            for person in Person.objects.all():
                person_roles = Role.objects.filter(person=person)
                for role in person_roles:
                    if role.name == role_name:
                        persons_with_role.append(person)
                        break
            output_list = []
            for person in persons_with_role:
                if not person.family.registration_submitted:
                    continue
                output_object = {}
                output_object['last_name'] = person.last_name
                output_object['first_name'] = person.first_name
                output_object['franchise'] = util.get_franchise(person)
                contact_info = util.get_contact_info(person)
                output_object['email'] = contact_info['email']
                output_object['phone'] = contact_info['phone']
                output_list.append(output_object)
            output_list.sort(key=lambda x: x["last_name"], reverse=True)

            csv_path = "/tmp/%s-volunteers-%s.csv" % (role_name, nowdate.isoformat())

            with open(csv_path, 'w', newline='') as csvfile:
                fieldnames = [
                    "last_name",
                    "first_name",
                    "franchise",
                    "email",
                    "phone"             
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()

                for o in output_list:
                    writer.writerow(o)

        no_role_families = []
        for family in Family.objects.all():
            if not family.registration_submitted:
                continue
            family_roles = []
            for person in Person.objects.filter(family=family):
                for role in Role.objects.filter(person=person):
                    family_roles.append(role)
            if len(family_roles) == 0:
                no_role_families.append(family)
        
        no_role_family_info_list = []
        for family in no_role_families:
            try:
                primary = Person.objects.get(family=family, is_user=True)
                franchise = util.get_franchise(primary)
                contact_info = util.get_contact_info(primary)
                info_object = {
                    "family_name" : family.family_name,
                    "franchise" : franchise,
                    "phone" : contact_info['phone'],
                    "email" : contact_info['email']
                }
                no_role_family_info_list.append(info_object)
            except Exception as e:
                print("Error making family %s info %s" % (family.family_name, e))
                continue

        csv_path = "/tmp/non-volunteer-families-%s.csv" % (nowdate.isoformat())

        with open(csv_path, 'w', newline='') as csvfile:
            fieldnames = [
                "family_name",
                "franchise",
                "phone",
                "email"           
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            for o in no_role_family_info_list:
                writer.writerow(o)
        

            

            
