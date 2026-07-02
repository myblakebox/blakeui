"use client";

import {Card, Tabs} from "@blakeui/react";

import {Iconify} from "@/components/iconify";

export function ActionBarCard() {
  return (
    <Card className="w-full">
      <Card.Content className="w-full items-center py-4">
        <Tabs className="w-full" defaultSelectedKey="like">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Post actions" className="w-full">
              <Tabs.Tab className="flex-1" id="like">
                <Iconify className="text-base" icon="heart" />
                Like
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab className="flex-1" id="comment">
                <Iconify className="text-base" icon="comment" />
                Comment
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab className="flex-1" id="share">
                <Iconify className="text-base" icon="arrow-right-from-square" />
                Share
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </Card.Content>
    </Card>
  );
}
