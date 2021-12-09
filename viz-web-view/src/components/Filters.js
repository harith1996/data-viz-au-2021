import React from "react";

export default class Filters extends React.Component {
	constructor(props) {
		super(props);
		this.state = { form: [] };
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.formData = props.formData || {};
		this.metadata = props.metadata;
		this.externalOnSubmit = props.onSubmit;
	}

	handleChange(event) {
		let [attributeName, attributeValue] = event.target.name.split("#");
		let filterType = event.target.getAttribute("filtertype");
		let isSelected = false;
		switch (filterType) {
			case "multiple":
				isSelected = event.target.checked;
				break;
			default:
				isSelected = false;
		}
		this.updateState(attributeName, attributeValue, filterType, isSelected);
	}

	updateState(attributeName, attributeValue, inputType, isSelected) {
		let attribute = this.state.form.find((a) => a.name === attributeName);
		if (attribute) {
			if (isSelected) {
				let selectedFilters = attribute.filters;
				selectedFilters.push({
					value: attributeValue,
					isSelected: isSelected,
				});
			} else {
				let filter = attribute.filters.find(
					(f) => f.value === attributeValue
				);
				attribute.filters.splice(attribute.filters.indexOf(filter), 1);
			}
		} else {
			attribute = {
				name: attributeName,
				filters: [
					{
						value: attributeValue,
						isSelected: isSelected,
					},
				],
			};
			this.state.form.push(attribute);
		}
		console.log(this.state.form);
	}

	handleSubmit(event) {
		event.preventDefault();
		this.externalOnSubmit(this.state.form);
	}

	render() {
		return (
			<form onChange={this.handleChange} onSubmit={this.handleSubmit}>
				<div className="filterForm">
				{this.metadata.filters.map((filter) => {
					let out;
					switch (filter.selectionType) {
						case "multiple":
							out = (
								<div
									key={filter.attributeName}
									className="filter"
								>
									<label className="filter-attribute">
										{filter.attributeName}
									</label>
									<div className="checkbox-list">
										{filter.values.map((value) => {
											let inputName = [
												filter.attributeName,
												value,
											].join("#");
											return (
												<div>
													<input
														type="checkbox"
														name={inputName}
														key={inputName}
														filtertype="multiple"
													></input>
													<label htmlFor={inputName}>
														{value}
													</label>
												</div>
											);
										})}
									</div>
								</div>
							);
							break;
						default:
							out = <div></div>;
					}
					return out;
				})}
				<input style={{marginTop: 30, marginLeft: 40, maxHeight: 30}} type='submit' value="Apply"></input>
				</div>
			</form>
		);
	}
}
