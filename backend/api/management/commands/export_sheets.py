from django.core.management.base import BaseCommand, CommandError

from api.models import Person, Family, Role, Player

import pytz
from datetime import date, datetime

import csv




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
    
    def handle(self, *args, **options):
        family_sheet_list = []
        player_sheet_list = []

        registered_families = Family.objects.filter(registration_submitted=True)
        for family in registered_families:
            family_object = {}
            family_object["family_id"] = family.id
            family_object["family_name"] = family.family_name
            family_object["dues"] = family.dues
            reg_date = family.registration_date
            dateString = "%Y-%m-%dT%H:%M:%S"
            tz = pytz.timezone('EST')
            reg_date = reg_date.astimezone(tz)
            reg_date_string = reg_date.strftime(dateString)
            family_object["registration_date"] = reg_date_string
            family_object["payment_option"] = family.payment_option
            family_object["notes"] = family.notes
        

            family_persons = Person.objects.filter(family=family)

            primary_person = family_persons.get(is_user=True)

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
                player_object["current_age"] = self.calculateAge(birthDate)
                player_object["first_franchise_choice"] = player.franchise_first
                player_object["second_franchise_choice"] = player.franchise_second
                player_object["incompatible_franchise"] = player.franchise_no
                player_object["age_exemption_requested"] = 'Y' if player.age_exemption_request == True else 'N'
                player_object["returning_player"] = 'Y' if player.returning == True else 'N'
                player_object["can_pitch"] = 'Y' if player.can_pitch == True else 'N'
                player_object["can_catch"] = 'Y' if player.can_catch == True else 'N'
                player_object["shirt_size"] = player.shirt_size
                player_sheet_list.append(player_object)



        print(family_sheet_list)

        print(player_sheet_list)

        nowdate = datetime.now()

        family_csv_path = "/tmp/family-%s.csv" % nowdate.isoformat()
        player_csv_path = "/tmp/player-%s.csv" % nowdate.isoformat()

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
                "current_age",
                "age_exemption_requested",
                "first_franchise_choice",
                "second_franchise_choice",
                "incompatible_franchise",
                "returning_player",
                "can_pitch",
                "can_catch",
                "shirt_size",
                "registration_date"                    
            ]
            writer = csv.DictWriter(csvfile, fieldnames=player_fieldnames)

            writer.writeheader()
            
            for p in player_sheet_list:
                writer.writerow(p)


