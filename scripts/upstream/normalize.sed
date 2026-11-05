# Normalizes HeroUI upstream sources to BlakeUI names. Run with: sed -i -f scripts/upstream/normalize.sed <files>
# Order matters: specific URLs first, then the generic heroui -> blakeui swap. See UPSTREAM.md.
s#https://heroui-assets\.nyc3\.cdn\.digitaloceanspaces\.com/#https://cdn.blakeui.com/#g
s#https://img\.heroui\.chat/image/avatar?w=400&h=400&u=\([0-9]*\)#https://cdn.blakeui.com/avatars/users/\1.jpg#g
s#https://github\.com/heroui-inc/heroui#https://github.com/myblakebox/BlakeUI#g
s#https://storybook-v3\.heroui\.com/\?#https://storybook.blakeui.com#g
s#https://x\.com/hero_ui#https://x.com/blake_ui#g
s#@hero_ui#@blake_ui#g
s#support@heroui\.com#support@blakebill.com#g
s#heroui-inc/heroui#blakeui-inc/blakeui#g
s#HEROUI#BLAKEUI#g
s#HeroUI#BlakeUI#g
s#heroui#blakeui#g
s#^import {Icon} from "@iconify/react";$#import {Icon} from "../iconify";#
