/**
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 * This file is part of the Cristal Wiki software prototype
 * @copyright  Copyright (c) 2023 XWiki SAS
 * @license    http://opensource.org/licenses/AGPL-3.0 AGPL-3.0
 *
 **/

import { Logger, CristalApp, WikiConfig } from "@cristal/api";
import { inject, injectable } from "inversify";
import { Renderer } from "../api/renderer";
import { Converter } from "../api/converter";

@injectable()
export class DefaultRenderer implements Renderer {
  private logger: Logger;
  private cristalApp: CristalApp;

  constructor(
    @inject<Logger>("Logger") logger: Logger,
    @inject<CristalApp>("CristalApp") cristalApp: CristalApp,
  ) {
    this.logger = logger;
    this.cristalApp = cristalApp;
  }

  async preloadConverters(): Promise<void> {
    const converters = this.cristalApp
      .getContainer()
      .getAll<Converter>("Converter");
    for (let i = 0; i < converters.length; i++) {
      this.logger.debug("Preloading converter", converters[i].getName());
      await converters[i].isConverterReady();
    }
  }

  convert(
    source: string,
    sourceSyntax: string,
    targetSyntax: string,
    wikiConfig: WikiConfig,
  ): string {
    const syntaxRenderer = sourceSyntax + "_" + targetSyntax;
    this.logger.debug("Loading converter for ", syntaxRenderer);
    try {
      const converter = this.cristalApp
        .getContainer()
        .getNamed<Converter>("Converter", syntaxRenderer);
      return converter.convert(source, wikiConfig);
    } catch (e) {
      this.logger.error("Could not find a converter for ", syntaxRenderer);
      return source;
    }
  }
}