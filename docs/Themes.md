Themes are design extensions for Codiad to give your personal style to your users. 

## How do I add a new theme to Codiad

All themes are located in `themes`. Put your new theme in this folder and replace the default theme in your configuration with the folder-name of your theme: https://github.com/Codiad/Codiad/blob/master/config.example.php#L20

## How to get your own theme into the marketplace

If you would like to submit a theme , please email the GitHub repository and information about your theme  to dev[at]codiad.com. Please note: While we test themes before adding them to this list we cannot guarantee quality or provide any warranty. If you have any issues please address them directly with the theme author.

## How to create a new theme for Codiad

Generally spoken, the easiest way is to copy the `default` folder and edit it to your needs. For public using of your theme, we would prefer to create a new repository on github containing all your changes. This repository should have at least one `readme.md` and `theme.json`. One example can be found at https://github.com/daeks/Codiad-Theme-Modern. 

As custom themes are not maintained by Codiad itself, we prefer to copy only components you want to modify as Codiad has a built-in functionality to take the `default` components if your theme does not have them. Looking at the example above, that would mean that only the filemanager would be modified and the other components loaded from the `default` theme. 

**Meta Data File**

    theme.json

Theme file contains information about the theme, like name or author. It is formatted in JSON:

    [{ "author" : "Your Name",
        "version": "Your Version",
        "url" : "Your Repository URL"
        }]

**How to assign a preview to the market**

Just attach a screenshot, named ```screen.png```, to your repository.