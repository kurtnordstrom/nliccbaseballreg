from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

from api import util

import pytz

from datetime import date, datetime

import csv

import os


class Command(BaseCommand):
    def makePersonListing(self, personList):
        nameList = []
        for person in personList:
            name = "%s %s" % (person.first_name, person.last_name)
            nameList.append(name)
        return " | ".join(nameList)
    
    def calculateAge(self, birthDate):
        today = date.today()
        return today.year - birthDate.year - ((today.month, today.day) < (birthDate.month, birthDate.day))
    

    def calculateAgeAtYearStart(self, birthDate):
        today = date.today()
        return today.year - birthDate.year - ((1, 1) < (birthDate.month, birthDate.day))    
    
    def find_franchise_file(self, franchise, file_list):
        for file_name in file_list:
            if file_name.startswith(franchise):
                return file_name
        return None
    
    def get_player_number(self, player_object, info_list):
        for info_dict in info_list:
            if info_dict["last_name"] == player_object["last_name"] \
                and info_dict["first_name"] == player_object["first_name"] \
                    and info_dict["date_of_birth"] == player_object["date_of_birth"]:
                return info_dict["number"]
        return None


    def make_sheets(self, family_set, prefix="", mode="summary", franchise_dir=None):
        family_sheet_list = []
        player_sheet_list = []

        #registered_families = Family.objects.filter(registration_submitted=True)
        families = family_set
        for family in families:
            try:
                family_persons = Person.objects.filter(family=family)
                primary_person = family_persons.get(is_user=True)
            except:
                print("Family %s does not have a valid primary person" % family)
                continue
            family_object = {}
            family_object["family_id"] = family.id
            family_object["family_name"] = family.family_name
            family_object["dues"] = family.dues
            reg_date = family.registration_date
            dateString = "%Y-%m-%dT%H:%M:%S"
            tz = pytz.timezone('EST')
            if reg_date:
                reg_date = reg_date.astimezone(tz)
                reg_date_string = reg_date.strftime(dateString)
            else:
                reg_date_string = ""
            family_object["registration_date"] = reg_date_string
            family_object["payment_option"] = family.payment_option
            family_object["notes"] = family.notes

            family_object["primary_email"] = primary_person.email
            family_object["primary_phone"] = primary_person.phone_primary

            non_player_persons = []
            player_persons = []
            family_roles = []

            for person in family_persons:
                try:
                    player = Player.objects.get(person=person)
                    player_persons.append(person)
                except:
                    non_player_persons.append(person)
                roles = Role.objects.filter(person=person)
                for role in roles:
                    role_name = role.name
                    if role_name not in family_roles:
                        family_roles.append(role_name)
            
            family_object["volunteer_roles"] = " | ".join(family_roles)           
            family_object["non_players"] = self.makePersonListing(non_player_persons)
            family_object["players"] = self.makePersonListing(player_persons) 
 
            family_sheet_list.append(family_object)

            for player_person in player_persons:
                player = Player.objects.get(person=player_person)
                player_object = {}
                player_object["last_name"] = player_person.last_name
                player_object["first_name"] = player_person.first_name
                player_object["family_name"] = family.family_name
                player_object["registration_date"] = reg_date_string
                birthDate = player_person.date_of_birth
                player_object["date_of_birth"] = birthDate.isoformat()
                #player_object["current_age"] = self.calculateAge(birthDate)
                player_object["year_start_age"] = self.calculateAgeAtYearStart(birthDate)
                player_object["first_franchise_choice"] = player.franchise_first
                player_object["second_franchise_choice"] = player.franchise_second
                player_object["incompatible_franchise"] = player.franchise_no
                player_object["age_exemption_requested"] = 'Y' if player.age_exemption_request == True else 'N'
                player_object["returning_player"] = 'Y' if player.returning == True else 'N'
                player_object["can_pitch"] = 'Y' if player.can_pitch == True else 'N'
                player_object["can_catch"] = 'Y' if player.can_catch == True else 'N'
                player_object["shirt_size"] = player.shirt_size
                primary_parent = util.get_primary_parent(player.person)
                if primary_parent:
                    player_object["parent"] = "%s %s" % (primary_parent.first_name, primary_parent.last_name)
                    player_object["parent email"] = primary_parent.email
                    player_object["parent address"] = primary_parent.address
                    player_object["parent phone"] = primary_parent.phone_primary
                else:
                    player_object["parent"] = ''
                    player_object["parent email"] = ''
                    player_object["parent address"] = ''
                    player_object["parent phone"] = ''

                player_sheet_list.append(player_object)



        #print(family_sheet_list)

        #print(player_sheet_list)

        nowdate = datetime.now()

        if mode == "summary":
            print(family_sheet_list)
            print(player_sheet_list)

            family_csv_path = "/tmp/%sfamily-%s.csv" % (prefix, nowdate.isoformat())
            player_csv_path = "/tmp/%splayer-%s.csv" % (prefix, nowdate.isoformat())

            with open(family_csv_path, 'w', newline='') as csvfile:
                fieldnames = [
                    "family_id",
                    "family_name",
                    "non_players",
                    "players",
                    "primary_email",
                    "primary_phone",
                    "volunteer_roles",
                    "dues",
                    "payment_option",
                    "notes",
                    "registration_date"
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                writer.writeheader()

                for f in family_sheet_list:
                    writer.writerow(f)

            with open(player_csv_path, 'w', newline='') as csvfile:
                player_fieldnames = [
                    "family_name",
                    "last_name",
                    "first_name",
                    "date_of_birth",
                    "year_start_age",
                    "age_exemption_requested",
                    "first_franchise_choice",
                    "second_franchise_choice",
                    "incompatible_franchise",
                    "returning_player",
                    "can_pitch",
                    "can_catch",
                    "shirt_size",
                    "registration_date",
                    "parent",
                    "parent phone",
                    "parent email",
                    "parent address"                         
                ]
                writer = csv.DictWriter(csvfile, fieldnames=player_fieldnames)

                writer.writeheader()
                
                for p in player_sheet_list:
                    writer.writerow(p)
        
        if mode == "franchises":
            franchises = [ "BLUE", "FOREST", "MAROON", "NAVY", "none" ]
            for franchise in franchises:
                franchise_info_list = []
                if franchise_dir:
                    file_listings = os.listdir(franchise_dir)
                    franchise_file = self.find_franchise_file(franchise.lower(), file_listings)
                    if franchise_file:
                        franchise_file_path = os.path.join(franchise_dir, franchise_file)
                        if os.path.exists(franchise_file_path):
                            with open(franchise_file_path) as franchise_csv:
                                reader = csv.DictReader(franchise_csv)
                                for row in reader:
                                    franchise_info_list.append(row)

                player_list = []
                for player_object in player_sheet_list:
                    if franchise == "none":
                        if not player_object["first_franchise_choice"]:
                            player_list.append(player_object) 
                    elif player_object["first_franchise_choice"] == franchise:
                        if len(franchise_info_list):
                            player_object["number"] = self.get_player_number(player_object, franchise_info_list)
                        player_list.append(player_object)
            
                player_list.sort(key=lambda x: x["date_of_birth"], reverse=True)

                print(player_list)

                csv_path = "/tmp/%s-players-%s.csv" % (franchise, nowdate.isoformat())

                with open(csv_path, 'w', newline='') as csvfile:
                    player_fieldnames = [
                        "last_name",
                        "first_name",
                        "number",
                        "date_of_birth",
                        "year_start_age",
                        "age_exemption_requested",
                        "first_franchise_choice",
                        "second_franchise_choice",
                        "incompatible_franchise",
                        "returning_player",
                        "can_pitch",
                        "can_catch",
                        "shirt_size",
                        "registration_date",
                        "family_name",
                        "parent",
                        "parent phone",
                        "parent email",
                        "parent address"                  
                    ]
                    if not len(franchise_info_list):
                        player_fieldnames.remove("number")

                    writer = csv.DictWriter(csvfile, fieldnames=player_fieldnames)
                    writer.writeheader()

                    for p in player_list:
                        writer.writerow(p)
                
        if mode == "coaches":
            franchises = [ "BLUE", "FOREST", "MAROON", "NAVY", "none"]
            for franchise in franchises:
                coach_list = []
                for family in families:
                    family_franchises = util.get_family_franchises(family)
                    if (len(family_franchises) < 1 and franchise != 'none'):
                        continue
                    elif len(family_franchises) < 1 or family_franchises[0] != franchise:
                        continue
                    person_list = Person.objects.filter(family=family)
                    for person in person_list:
                        person_roles = Role.objects.filter(person=person)
                        is_coach = False
                        coach_role = ''
                        for role in person_roles:
                            if role.name in [ 'HEAD_COACH', 'ASSISTANT_COACH' ]:
                                is_coach = True
                                coach_role = role.name
                                break
                    
                        if is_coach:
                            person_object = {}
                            person_object["first_name"] = person.first_name
                            person_object["last_name"] = person.last_name
                            person_object["email"] = person.email
                            person_object["phone"] = person.phone_primary
                            person_object['role'] = coach_role
                            coach_list.append(person_object)
                    

                coach_list.sort(key=lambda x: x["last_name"])
                
                csv_path = "/tmp/%s-coaches-%s.csv" % (franchise, nowdate.isoformat())

                with open(csv_path, 'w', newline='') as csvfile:
                    coach_fieldnames = [
                        "last_name",
                        "first_name",
                        'role',
                        "email",
                        "phone"
                    ]

                    writer = csv.DictWriter(csvfile, fieldnames=coach_fieldnames)
                    writer.writeheader()

                    for coach in coach_list:
                        writer.writerow(coach)

            

    def add_arguments(self, parser):
        parser.add_argument('operation', type=str, help='What kind of export', choices=['registered', 'unregistered', 'byfranchise', 'coachlist'])
        parser.add_argument('--franchise_dir', type=str, help='Directory where static franchise csvs are', default=None)

    def handle(self, *args, **options):
        franchise_dir=None
        if options['franchise_dir']:
            franchise_dir = os.path.abspath(options['franchise_dir'])


        if options['operation'] == 'registered':
            registered_families = Family.objects.filter(registration_submitted=True)
            self.make_sheets(registered_families)
        if options['operation'] == 'unregistered':
            unregistered_families = Family.objects.filter(registration_submitted=False)
            self.make_sheets(unregistered_families, "unregistered-")
        if options['operation'] == 'byfranchise':
            registered_families = Family.objects.filter(registration_submitted=True)
            self.make_sheets(registered_families, "", "franchises", franchise_dir)
        if options['operation'] == 'coachlist':
            registered_families = Family.objects.filter(registration_submitted=True)
            self.make_sheets(registered_families, "", "coaches")


