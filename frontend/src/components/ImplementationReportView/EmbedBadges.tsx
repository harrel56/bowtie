import React, { useState } from "react";
import URI from "urijs";

import CopyToClipboard from "../CopyToClipboard";
import Dialect from "../../data/Dialect";
import { Implementation } from "../../data/parseReportData";
import { complianceBadgeFor, versionsBadgeFor } from "../../data/Badge";

const EmbedBadges: React.FC<{
  implementation: Implementation;
}> = ({ implementation }) => {
  const [activeTab, setActiveTab] = useState("Markdown");
  const [activeBadge, setActiveBadge] = useState("JSON Schema Versions");
  const [badgeURI, setBadgeURI] = useState(versionsBadgeFor(implementation));

  const handleSelectBadge = (badgeName: string, URI: URI) => {
    setActiveBadge(badgeName);
    setBadgeURI(URI);
  };

  const handleSelectTab = (tabKey: string | null) => {
    if (tabKey) {
      setActiveTab(tabKey);
    }
  };

  const altTextFor = (badgeName: string): string => {
    return badgeName === "JSON Schema Versions"
      ? "JSON Schema Versions"
      : Dialect.withName(activeBadge).prettyName;
  };

  const results = Object.entries(implementation.results).sort(([a], [b]) =>
    Dialect.withName(a).compare(Dialect.withName(b)),
  );

  return (
    <div className="container d-flex align-items-center justify-content-end dropdown px-0 col-12">
      <button
        className="btn btn-sm btn-success dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
      >
        Badges
      </button>
      <div className="dropdown-menu mx-auto">
        <div className="px-4 pt-1">
          <h4 className="ps-sm-1 text-nowrap text-center d-flex justify-content-center justify-content-lg-start">
            Embed a Badge
          </h4>
          <div className="dropdown d-lg-flex justify-content-center justify-content-sm-start pt-2 text-center">
            <button
              className="btn btn-sm btn-primary dropdown-toggle mw-100 overflow-hidden"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {altTextFor(activeBadge)}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <h6 className="dropdown-header">Implementation Metadata</h6>
              <li key={"JSON Schema Versions"}>
                <button
                  className={`dropdown-item btn btn-sm ${
                    activeBadge === "JSON Schema Versions" ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSelectBadge(
                      "JSON Schema Versions",
                      versionsBadgeFor(implementation),
                    )
                  }
                >
                  {"JSON Schema Versions"}
                </button>
              </li>
              <h6 className="dropdown-header">Specification Compliance</h6>
              {results.map(([result]) => (
                <li key={result}>
                  <button
                    className={`dropdown-item btn btn-sm ${
                      result === activeBadge ? "active" : ""
                    }`}
                    onClick={() =>
                      handleSelectBadge(
                        result,
                        complianceBadgeFor(
                          implementation,
                          Dialect.withName(result),
                        ),
                      )
                    }
                  >
                    {Dialect.withName(result).prettyName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container vw-50 d-flex justify-content-center align-items-center flex-column pt-3">
          <ul className="nav nav-pills justify-content-center">
            {supportedFormats.map((formatItem, index) => {
              return (
                <li className="nav-item" key={index}>
                  <button
                    className={`nav-link btn btn-sm ${
                      activeTab === formatItem.name ? "active" : ""
                    }`}
                    onClick={() => handleSelectTab(formatItem.name)}
                  >
                    {formatItem.name}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="tab-content mt-2 pt-2 pb-2 w-100">
            {supportedFormats.map((formatItem, index) => {
              const badgeEmbed = formatItem.generateEmbed(
                badgeURI.href(),
                altTextFor(activeBadge),
              );
              return (
                <div
                  key={index}
                  className={`tab-pane ${
                    activeTab === formatItem.name ? "active" : ""
                  } border rounded pt-1 px-4 mx-2`}
                >
                  <div className="d-flex align-items-center justify-content-center px-1">
                    <div className="w-100">
                      <span className="font-monospace text-body-secondary fs-6 ps-2 d-block">
                        <pre className="pt-2 pb-2">
                          <code>{badgeEmbed}</code>
                        </pre>
                      </span>
                    </div>
                    <div className="ms-auto pb-2 px-1">
                      <CopyToClipboard textToCopy={badgeEmbed} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface BadgeFormat {
  name: string;
  generateEmbed: (badgeURI: string, altText: string) => string;
}

const supportedFormats: BadgeFormat[] = [
  {
    name: "URL",
    generateEmbed: (badgeURI) => `${badgeURI}`,
  },
  {
    name: "Markdown",
    generateEmbed: (badgeURI, altText) => `![${altText}](${badgeURI})`,
  },
  {
    name: "reST",
    generateEmbed: (badgeURI, altText) =>
      `.. image:: ${badgeURI}\n    :alt: ${altText}`,
  },
  {
    name: "AsciiDoc",
    generateEmbed: (badgeURI, altText) => `image:${badgeURI}[${altText}]`,
  },
  {
    name: "HTML",
    generateEmbed: (badgeURI, altText) =>
      `<img alt="${altText}" src="${badgeURI}"/>`,
  },
];

export default EmbedBadges;
